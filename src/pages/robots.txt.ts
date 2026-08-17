import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/site-urls';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${absoluteUrl('/sitemap.xml', site)}`,
    `Sitemap: ${absoluteUrl('/sitemap.txt', site)}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
