import type { APIRoute } from 'astro';
import { absoluteUrl, getSitemapEntries } from '../lib/site-urls';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const entries = await getSitemapEntries();
  const body = `${entries.map(({ path }) => absoluteUrl(path, site)).join('\n')}\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
