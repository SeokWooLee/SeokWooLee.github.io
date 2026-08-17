import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export const PAGE_SIZE = 5;

export const CATEGORIES = [
  {
    slug: 'ios-swift',
    label: 'iOS & Swift',
    eyebrow: 'BUILD',
    description: 'Swift 언어와 iOS 생태계를 원리부터 실전까지 파고듭니다.',
  },
  {
    slug: 'ai-tools',
    label: 'AI & Tools',
    eyebrow: 'EXPLORE',
    description: 'AI 에이전트와 개발 도구를 직접 써보고 쓸모를 검증합니다.',
  },
  {
    slug: 'software-design',
    label: 'Software Design',
    eyebrow: 'DESIGN',
    description: '설계 원칙과 패턴을 외우지 않고 맥락과 선택 기준으로 이해합니다.',
  },
  {
    slug: 'computer-science',
    label: 'Computer Science',
    eyebrow: 'GROUND',
    description: '자료구조와 운영체제의 기초 체력을 차근차근 다집니다.',
  },
] as const;

export type Category = (typeof CATEGORIES)[number];

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

export function getPostImage(post: Post): string {
  return post.data.header.og_image ?? post.data.header.teaser ?? '/og.png';
}

export function getCategory(post: Post): Category {
  const declared = post.data.categories.join(' ').toLowerCase();
  const source = `${declared} ${post.data.title} ${post.data.tags.join(' ')}`.toLowerCase();

  if (/\bai\b|gpt|claude|gemini|agent|에이전트|프롬프트|mcp|llm|코딩 도구|개발 도구/.test(source)) {
    return CATEGORIES[1];
  }

  if (
    /swift|ios|objective-c|objectivec|xcode|uikit|swiftui|combine|reactorkit|viper|ribs|tuist|xctest|nstimer|autorelease|cocoa/.test(
      source,
    )
  ) {
    return CATEGORIES[0];
  }

  if (/컴퓨터 과학|자료구조|알고리즘|프로세스|스레드|동시성|병렬성|스택|힙|큐|메모리 구조/.test(source)) {
    return CATEGORIES[3];
  }

  return CATEGORIES[2];
}

export function getPostsByCategory(posts: Post[], category: Category): Post[] {
  return posts.filter((post) => getCategory(post).slug === category.slug);
}

export function getTagCounts(posts: Post[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'ko'));
}
