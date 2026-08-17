import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL ?? 'https://gae-balbadak.pages.dev';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
