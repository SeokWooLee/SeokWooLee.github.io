#!/usr/bin/env ruby
# frozen_string_literal: true

# Optimizes only images referenced by HTML <img> tags in _posts.
#
# Safety policy:
# - Opaque, high-detail PNGs are converted to JPEG only when the candidate is
#   smaller. The 0.75 bytes/pixel boundary separates the current corpus's
#   photo/AI-art cluster (>= 0.75) from its flat diagram cluster (<= 0.26).
# - Low-density and transparent PNGs stay lossless so text and diagram edges
#   are not degraded.
# - GIFs are never rewritten, preserving animation.
# - Static images wider than MAX_WIDTH are resized without upscaling.
# - A format conversion is installed only when it is smaller than its source.
# - A resize is always installed so the maximum-width invariant is guaranteed.
# - Post references and intrinsic/loading attributes are updated together.
#
# The script uses macOS `sips`, avoiding project dependencies. Run without
# --apply for a read-only inventory and plan.

require "fileutils"
require "json"
require "open3"
require "optparse"
require "set"
require "tempfile"

ROOT = File.expand_path("..", __dir__)
POST_DIR = File.join(ROOT, "_posts")
LOCAL_PREFIX = "/assets/images/posts/"
STATIC_EXTENSIONS = %w[.png .jpg .jpeg].freeze
SUPPORTED_EXTENSIONS = (STATIC_EXTENSIONS + %w[.gif .webp]).freeze
HIGH_DETAIL_BYTES_PER_PIXEL = 0.75

ImageInfo = Struct.new(:width, :height, :format, :has_alpha, :bytes, keyword_init: true)
ImagePlan = Struct.new(:source_url, :target_url, :source_path, :target_path,
                       :source_info, :target_width, :target_height, :action,
                       :reason, keyword_init: true)

options = {
  apply: false,
  max_width: 1200,
  jpeg_quality: 90,
  json: false
}

OptionParser.new do |parser|
  parser.banner = "Usage: ruby scripts/optimize_post_images.rb [options]"
  parser.on("--apply", "Write optimized images and update posts") { options[:apply] = true }
  parser.on("--max-width WIDTH", Integer, "Maximum static-image width (default: 1200)") do |value|
    options[:max_width] = value
  end
  parser.on("--jpeg-quality QUALITY", Integer, "sips JPEG quality, 1-100 (default: 90)") do |value|
    options[:jpeg_quality] = value
  end
  parser.on("--json", "Print the report as JSON") { options[:json] = true }
end.parse!

abort "--max-width must be positive" unless options[:max_width].positive?
abort "--jpeg-quality must be between 1 and 100" unless (1..100).cover?(options[:jpeg_quality])
abort "sips is required" unless system("command", "-v", "sips", out: File::NULL)

def capture!(*command)
  stdout, stderr, status = Open3.capture3(*command)
  return stdout if status.success?

  abort "Command failed (#{command.join(' ')}):\n#{stderr}"
end

def image_info(path)
  output = capture!("sips", "-g", "pixelWidth", "-g", "pixelHeight", "-g", "format",
                    "-g", "hasAlpha", path)
  properties = output.lines.each_with_object([]) do |line, result|
    match = line.match(/^\s+(pixelWidth|pixelHeight|format|hasAlpha):\s+(.+)$/)
    result << [match[1], match[2].strip] if match
  end.to_h

  width = Integer(properties.fetch("pixelWidth"))
  height = Integer(properties.fetch("pixelHeight"))
  ImageInfo.new(width: width, height: height, format: properties.fetch("format"),
                has_alpha: properties.fetch("hasAlpha", "no") == "yes",
                bytes: File.size(path))
rescue KeyError, ArgumentError => error
  abort "Could not read image metadata for #{path}: #{error.message}"
end

def local_path(url)
  clean_url = url.split(/[?#]/, 2).first
  abort "Unsafe image URL: #{url}" if clean_url.include?("..")

  path = File.expand_path(clean_url.delete_prefix("/"), ROOT)
  root_prefix = "#{File.expand_path(ROOT)}/"
  abort "Image escaped repository root: #{url}" unless path.start_with?(root_prefix)

  path
end

def scaled_dimensions(info, max_width)
  return [info.width, info.height] if info.width <= max_width

  height = (info.height * max_width.fdiv(info.width)).round
  [max_width, height]
end

def html_src(tag)
  tag[/\bsrc\s*=\s*["']([^"']+)["']/i, 1]
end

def local_image_url?(url)
  url&.start_with?(LOCAL_PREFIX)
end

def replace_performance_attributes(tag, width:, height:, eager:)
  %w[width height loading fetchpriority decoding].each do |attribute|
    tag = tag.gsub(/\s+#{attribute}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, "")
  end

  loading = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'
  attributes = %(width="#{width}" height="#{height}" #{loading} decoding="async")
  tag.sub(/(\s*\/?>)\z/, " #{attributes}\\1")
end

def external_references(source_url)
  output, _stderr, status = Open3.capture3("git", "-c", "core.quotepath=false", "grep",
                                           "-l", "-z", "-F", "--", source_url,
                                           chdir: ROOT)
  return [] if status.exitstatus == 1
  abort "git grep failed while checking #{source_url}" unless status.success?

  output.split("\0").reject { |path| path.start_with?("_posts/") }
end

post_paths = Dir.glob(File.join(POST_DIR, "*.{md,markdown}")).sort
abort "No posts found in #{POST_DIR}" if post_paths.empty?

post_text = post_paths.to_h { |path| [path, File.read(path)] }
usage = Hash.new { |hash, key| hash[key] = { posts: Set.new, first: false, count: 0 } }

post_text.each do |path, text|
  local_index = 0
  text.scan(/<img\b[^>]*>/mi).each do |tag|
    url = html_src(tag)
    next unless local_image_url?(url)

    clean_url = url.split(/[?#]/, 2).first
    extension = File.extname(clean_url).downcase
    abort "Unsupported post image extension #{extension}: #{clean_url}" unless SUPPORTED_EXTENSIONS.include?(extension)

    usage[clean_url][:posts] << path
    usage[clean_url][:first] ||= local_index.zero?
    usage[clean_url][:count] += 1
    local_index += 1
  end
end

plans = usage.keys.sort.map do |source_url|
  source_path = local_path(source_url)
  abort "Missing post image: #{source_url}" unless File.file?(source_path)

  info = image_info(source_path)
  extension = File.extname(source_url).downcase
  width, height = scaled_dimensions(info, options[:max_width])
  bytes_per_pixel = info.bytes.fdiv(info.width * info.height)
  opaque_high_detail_png = extension == ".png" && !info.has_alpha &&
                           bytes_per_pixel >= HIGH_DETAIL_BYTES_PER_PIXEL

  if opaque_high_detail_png
    target_url = source_url.sub(/\.png\z/i, ".jpg")
    target_path = local_path(target_url)
    abort "JPEG target already exists: #{target_url}" if File.exist?(target_path)
    ImagePlan.new(source_url: source_url, target_url: target_url, source_path: source_path,
                  target_path: target_path, source_info: info,
                  target_width: width, target_height: height, action: :convert_jpeg,
                  reason: "opaque high-detail PNG (#{bytes_per_pixel.round(2)} bytes/pixel)")
  elsif STATIC_EXTENSIONS.include?(extension) && info.width > options[:max_width]
    ImagePlan.new(source_url: source_url, target_url: source_url, source_path: source_path,
                  target_path: source_path,
                  source_info: info, target_width: width, target_height: height, action: :resize,
                  reason: "wider than #{options[:max_width]}px")
  else
    ImagePlan.new(source_url: source_url, target_url: source_url, source_path: source_path,
                  target_path: source_path,
                  source_info: info, target_width: info.width, target_height: info.height,
                  action: :keep, reason: extension == ".gif" ? "animation preserved" : "already within policy")
  end
end

conversion_map = {}
final_info = plans.to_h { |plan| [plan.source_url, plan.source_info] }
installed = []
skipped_conversions = []
resized_despite_growth = []
removed_converted_sources = []
bytes_before = plans.sum { |plan| plan.source_info.bytes }

if options[:apply]
  plans.each do |plan|
    next if plan.action == :keep

    tempfile = nil
    begin
      output_extension = plan.action == :convert_jpeg ? ".jpg" : File.extname(plan.source_path)
      tempfile = Tempfile.new(["post-image-", output_extension])
      tempfile.close

      command = ["sips"]
      if plan.action == :convert_jpeg || %w[.jpg .jpeg].include?(File.extname(plan.source_path).downcase)
        command.concat(["-s", "format", "jpeg", "-s", "formatOptions", options[:jpeg_quality].to_s])
      end
      command.concat(["--resampleWidth", plan.target_width.to_s]) if plan.source_info.width > plan.target_width
      command.concat([plan.source_path, "--out", tempfile.path])
      capture!(*command)

      candidate_size = File.size(tempfile.path)
      if candidate_size >= plan.source_info.bytes && plan.action == :convert_jpeg
        skipped_conversions << plan.source_url
        next
      end
      resized_despite_growth << plan.source_url if candidate_size >= plan.source_info.bytes

      FileUtils.mkdir_p(File.dirname(plan.target_path))
      FileUtils.mv(tempfile.path, plan.target_path)

      if plan.action == :convert_jpeg
        conversion_map[plan.source_url] = plan.target_url
      end

      optimized_info = image_info(plan.target_path)
      final_info[plan.source_url] = optimized_info
      final_info[plan.target_url] = optimized_info
      installed << {
        source: plan.source_url,
        target: plan.target_url,
        action: plan.action,
        before: plan.source_info.bytes,
        after: optimized_info.bytes,
        width: optimized_info.width,
        height: optimized_info.height
      }
    ensure
      tempfile.close! if tempfile
    end
  end

  post_text.each do |path, original|
    updated = original.dup
    conversion_map.each { |source, target| updated.gsub!(source, target) }

    local_index = 0
    updated.gsub!(/<img\b[^>]*>/mi) do |tag|
      url = html_src(tag)
      next tag unless local_image_url?(url)

      clean_url = url.split(/[?#]/, 2).first
      info = final_info.fetch(clean_url) do
        # Converted URLs are indexed under both the original and target URL.
        image_info(local_path(clean_url))
      end
      eager = local_index.zero?
      local_index += 1
      replace_performance_attributes(tag, width: info.width, height: info.height, eager: eager)
    end

    File.write(path, updated) if updated != original
  end

  # Check references after posts have switched to JPEG. NUL-delimited git
  # output avoids quoted Korean paths being mistaken for external references.
  conversion_map.each_key do |source_url|
    source_path = local_path(source_url)
    next unless external_references(source_url).empty?

    FileUtils.rm(source_path)
    removed_converted_sources << source_url
  end
end

planned_counts = plans.group_by(&:action).transform_values(&:length)
installed_bytes_before = installed.sum { |item| item[:before] }
installed_bytes_after = installed.sum { |item| item[:after] }
bytes_after = bytes_before - installed_bytes_before + installed_bytes_after
posts_missing_dimensions = post_text.sum do |_path, text|
  text.scan(/<img\b[^>]*>/mi).count do |tag|
    local_image_url?(html_src(tag)) && !(tag.match?(/\bwidth\s*=/i) && tag.match?(/\bheight\s*=/i))
  end
end

report = {
  mode: options[:apply] ? "apply" : "dry-run",
  posts: post_paths.length,
  unique_images: plans.length,
  image_occurrences: usage.values.sum { |entry| entry[:count] },
  formats: plans.group_by { |plan| File.extname(plan.source_url).downcase }.transform_values(&:length),
  planned: planned_counts,
  missing_intrinsic_dimensions_before: posts_missing_dimensions,
  installed: installed.length,
  converted_to_jpeg: installed.count { |item| item[:action] == :convert_jpeg },
  resized_in_place: installed.count { |item| item[:action] == :resize },
  removed_converted_sources: removed_converted_sources.length,
  skipped_conversions_because_not_smaller: skipped_conversions.length,
  resized_despite_byte_growth: resized_despite_growth.length,
  referenced_bytes_before: bytes_before,
  referenced_bytes_after: bytes_after,
  bytes_saved: bytes_before - bytes_after,
  percent_saved: bytes_before.zero? ? 0.0 : ((bytes_before - bytes_after) * 100.0 / bytes_before).round(2)
}

if options[:json]
  puts JSON.pretty_generate(report)
else
  report.each { |key, value| puts "#{key}: #{value.is_a?(Hash) ? value.sort.to_h : value}" }
  unless options[:apply]
    puts "\nDry run only. Re-run with --apply to write #{planned_counts.fetch(:convert_jpeg, 0) + planned_counts.fetch(:resize, 0)} planned optimizations."
  end
end
