import { getCollection } from 'astro:content';
import { CATEGORIES, getPostPath, getPublishedDate, PAGE_SIZE, sortPosts } from './posts';

export interface SitemapEntry {
  path: string;
  lastModified?: Date;
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const posts = sortPosts(await getCollection('posts'));
  const pages = await getCollection('pages');
  const latestModified = posts[0]?.data.last_modified_at ?? new Date('2024-12-08T00:00:00+09:00');
  const pageCount = Math.ceil(posts.length / PAGE_SIZE);
  const pagination = Array.from({ length: pageCount - 1 }, (_, index) => ({
    path: `/page${index + 2}/`,
    lastModified: latestModified,
  }));
  const categoryPages = CATEGORIES.map((category) => ({
    path: `/categories/${category.slug}/`,
    lastModified: latestModified,
  }));

  return [
    { path: '/', lastModified: latestModified },
    ...posts.map((post) => ({
      path: getPostPath(post),
      lastModified: post.data.last_modified_at ?? getPublishedDate(post),
    })),
    ...pagination,
    ...pages.map((page) => ({
      path: page.data.permalink,
      lastModified: page.data.last_modified_at ?? latestModified,
    })),
    { path: '/categories/', lastModified: latestModified },
    ...categoryPages,
    { path: '/tags/', lastModified: latestModified },
  ];
}

export function absoluteUrl(path: string, site?: URL): string {
  return new URL(path, site ?? new URL('https://gae-balbadak.pages.dev')).href;
}
