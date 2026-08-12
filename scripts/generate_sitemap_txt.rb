#!/usr/bin/env ruby
# frozen_string_literal: true

require "rexml/document"
require "uri"

SOURCE_PATH = ARGV.fetch(0, "_site/sitemap.xml")
OUTPUT_PATH = ARGV.fetch(1, "_site/sitemap.txt")
EXPECTED_HOST = "seokwoolee.github.io"
SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"

document = REXML::Document.new(File.read(SOURCE_PATH, encoding: "UTF-8"))
namespaces = { "sitemap" => SITEMAP_NAMESPACE }
urls = REXML::XPath.match(document, "//sitemap:url/sitemap:loc", namespaces).map do |node|
  node.text.to_s.strip
end

abort "No URLs found in #{SOURCE_PATH}" if urls.empty?

url_counts = Hash.new(0)
urls.each { |url| url_counts[url] += 1 }
duplicates = url_counts.select { |_url, count| count > 1 }.keys
abort "Duplicate URLs found: #{duplicates.join(', ')}" unless duplicates.empty?

invalid_urls = urls.reject do |url|
  uri = URI.parse(url)
  uri.scheme == "https" && uri.host == EXPECTED_HOST && uri.userinfo.nil? && uri.fragment.nil?
rescue URI::InvalidURIError
  false
end
abort "Invalid URLs found: #{invalid_urls.join(', ')}" unless invalid_urls.empty?

File.open(OUTPUT_PATH, "w:UTF-8") do |file|
  urls.each { |url| file.puts(url) }
end

puts "Generated #{OUTPUT_PATH} with #{urls.length} URLs"
