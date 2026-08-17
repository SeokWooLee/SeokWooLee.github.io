import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

const DAY_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Seoul',
});

export function getPublishedDate(post: Post): Date {
  const match = post.id.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return post.data.last_modified_at;
  }

  const [, year, month, day] = match;
  return new Date(`${year}-${month}-${day}T00:00:00+09:00`);
}

export function formatDate(date: Date): string {
  return DAY_FORMAT.format(date);
}

export function normalizePath(path: string): string {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function getPostPath(post: Post): string {
  return normalizePath(post.data.permalink);
}

export function getPostSlug(post: Post): string {
  return getPostPath(post).replace(/^\//, '').replace(/\/$/, '');
}

export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort(
    (left, right) => getPublishedDate(right).getTime() - getPublishedDate(left).getTime(),
  );
}

export function getReadingMinutes(post: Post): number {
  const text = (post.body ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`\[\]()|-]/g, ' ');
  const characters = text.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(characters / 500));
}

export function getPrimaryCategory(post: Post): string {
  if (post.data.categories[0]) {
    return post.data.categories[0];
  }

  const source = `${post.data.title} ${post.data.tags.join(' ')}`.toLowerCase();

  if (/swift|ios|objective-c|xcode|uikit|swiftui/.test(source)) return 'iOS';
  if (/ai|gpt|claude|agent|에이전트|프롬프트|mcp|llm/.test(source)) return 'AI';
  return 'Software Engineering';
}
