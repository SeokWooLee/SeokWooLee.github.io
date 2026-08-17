import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distRoot = join(projectRoot, 'dist');
const postsRoot = join(projectRoot, 'src', 'content', 'posts');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function outputPathForUrl(value) {
  const path = decodeURIComponent(new URL(value).pathname);
  return path === '/' ? join(distRoot, 'index.html') : join(distRoot, path.slice(1), 'index.html');
}

assert(existsSync(distRoot), 'dist/가 없습니다. npm run build를 먼저 실행하세요.');

const sitemapXml = readFileSync(join(distRoot, 'sitemap.xml'), 'utf8');
const sitemapText = readFileSync(join(distRoot, 'sitemap.txt'), 'utf8');
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeXml(match[1]));
const textUrls = sitemapText.trim().split('\n');
const sitemapPaths = new Set(sitemapUrls.map((value) => decodeURIComponent(new URL(value).pathname)));

assert(sitemapUrls.length === new Set(sitemapUrls).size, 'sitemap.xml에 중복 URL이 있습니다.');
assert(sitemapUrls.length === textUrls.length, 'XML과 텍스트 sitemap의 URL 수가 다릅니다.');
assert(sitemapUrls.every((value, index) => value === textUrls[index]), 'XML과 텍스트 sitemap의 URL 순서가 다릅니다.');
assert(!sitemapXml.includes('seokwoolee.github.io'), 'sitemap.xml에 이전 도메인이 남아 있습니다.');

for (const url of sitemapUrls) {
  assert(existsSync(outputPathForUrl(url)), `sitemap URL의 HTML이 없습니다: ${url}`);
}

const postFiles = readdirSync(postsRoot).filter((name) => name.endsWith('.md'));
const permalinks = postFiles.map((name) => {
  const source = readFileSync(join(postsRoot, name), 'utf8');
  const match = source.match(/^permalink:\s*["']?(.+?)["']?\s*$/m);
  assert(match, `permalink가 없는 글입니다: ${name}`);
  return match[1];
});

assert(permalinks.length === new Set(permalinks).size, '글 permalink가 중복됩니다.');
for (const permalink of permalinks) {
  assert(sitemapPaths.has(permalink), `sitemap에서 글 URL이 누락됐습니다: ${permalink}`);
}

const expectedPageCount = Math.ceil(permalinks.length / 5);
for (let page = 2; page <= expectedPageCount; page += 1) {
  assert(sitemapPaths.has(`/page${page}/`), `목록 페이지가 sitemap에서 누락됐습니다: /page${page}/`);
}

const htmlFiles = walk(distRoot).filter((path) => path.endsWith('.html'));
const missingImages = new Set();
for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, 'utf8');
  for (const match of html.matchAll(/<img[^>]+src="(\/[^"]+)"/g)) {
    const imagePath = decodeURIComponent(match[1].split(/[?#]/)[0]);
    if (!existsSync(join(distRoot, imagePath.slice(1)))) missingImages.add(imagePath);
  }
}

assert(missingImages.size === 0, `로컬 이미지가 누락됐습니다:\n${[...missingImages].join('\n')}`);

const googleVerificationFile = 'googlef513e75fd4fd1b71.html';
const requiredFiles = [
  '_redirects',
  '404.html',
  'ads.txt',
  'favicon.ico',
  'robots.txt',
  'rss.xml',
  'sitemap.xml',
  'sitemap.txt',
  googleVerificationFile,
  'naver7d3beabb75467760ac49851548c4085c.html',
];
for (const file of requiredFiles) assert(existsSync(join(distRoot, file)), `필수 산출물이 없습니다: ${file}`);

const googleVerification = readFileSync(join(distRoot, googleVerificationFile), 'utf8').trim();
assert(
  googleVerification === `google-site-verification: ${googleVerificationFile}`,
  'Google Search Console 인증 파일 내용이 올바르지 않습니다.',
);

const redirects = readFileSync(join(distRoot, '_redirects'), 'utf8');
const googleVerificationPath = `/${googleVerificationFile}`;
const googleVerificationRewrite = `${googleVerificationPath} ${googleVerificationPath.replace(/\.html$/, '')} 200`;
assert(
  redirects.split('\n').some((line) => line.trim() === googleVerificationRewrite),
  'Google Search Console 인증 파일의 Cloudflare Pages rewrite가 없습니다.',
);

const largestFile = walk(distRoot)
  .map((path) => ({ path, bytes: statSync(path).size }))
  .sort((left, right) => right.bytes - left.bytes)[0];

console.log(`Build validation passed:`);
console.log(`- ${permalinks.length} post URLs`);
console.log(`- ${sitemapUrls.length} unique sitemap URLs`);
console.log(`- ${htmlFiles.length} HTML files with no missing local images`);
console.log(`- largest asset ${(largestFile.bytes / 1024 / 1024).toFixed(2)} MiB`);
