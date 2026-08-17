import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { getPostPath, getPublishedDate, sortPosts } from '../lib/posts';

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const posts = sortPosts(await getCollection('posts'));

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? 'https://gae-balbadak.pages.dev',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: getPublishedDate(post),
      link: getPostPath(post),
      categories: post.data.tags,
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
};
