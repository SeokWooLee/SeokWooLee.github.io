import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '**/*.md',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    permalink: z.string().startsWith('/'),
    header: z
      .object({
        og_image: z.string().optional(),
        teaser: z.string().optional(),
      }),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    toc: z.boolean().default(true),
    toc_sticky: z.boolean().default(true),
    last_modified_at: z.coerce.date(),
  }),
});

const pages = defineCollection({
  loader: glob({
    base: './src/content/pages',
    pattern: '**/*.md',
  }),
  schema: z.object({
    title: z.string(),
    permalink: z.string().startsWith('/'),
    description: z.string(),
    last_modified_at: z.coerce.date().optional(),
  }),
});

export const collections = { posts, pages };
