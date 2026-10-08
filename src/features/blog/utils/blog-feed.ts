import { BlogPostSummary } from '../types/blog.types';

export type BlogFeedItemKind = 'featured' | 'compact' | 'standard';

export type BlogFeedItem = {
  kind: BlogFeedItemKind;
  post: BlogPostSummary;
};

/** Web listesinde manşetin hemen ardından gelen kompakt kart sayısı. */
const COMPACT_POST_COUNT = 4;

/**
 * Web `BlogListing` düzenini tek sütunlu akışa çevirir: sabitlenmiş/öne çıkan
 * (yoksa ilk) yazı manşet, sonraki dört yazı kompakt kart, kalanı standart kart.
 * Sonsuz kaydırmada sayfalar arası kayan aynı yazı iki kez gösterilmez.
 */
export function buildBlogFeedItems(posts: BlogPostSummary[]): BlogFeedItem[] {
  const seen = new Set<string>();
  const unique = posts.filter((post) => {
    const key = post.id || post.slug;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const featured = unique.find((post) => post.isHighlighted) ?? unique[0];
  if (!featured) return [];

  const rest = unique.filter((post) => post !== featured);
  return [
    { kind: 'featured', post: featured },
    ...rest.slice(0, COMPACT_POST_COUNT).map((post): BlogFeedItem => ({ kind: 'compact', post })),
    ...rest.slice(COMPACT_POST_COUNT).map((post): BlogFeedItem => ({ kind: 'standard', post })),
  ];
}
