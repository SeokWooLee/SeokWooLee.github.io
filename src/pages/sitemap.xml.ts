import type { APIRoute } from 'astro';
import { absoluteUrl, getSitemapEntries } from '../lib/site-urls';

export const prerender = true;

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const entries = await getSitemapEntries();
  const urls = entries
    .map(({ path, lastModified }) => {
      const lastmod = lastModified ? `<lastmod>${lastModified.toISOString()}</lastmod>` : '';
      return `<url><loc>${escapeXml(absoluteUrl(path, site))}</loc>${lastmod}</url>`;
    })
    .join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
