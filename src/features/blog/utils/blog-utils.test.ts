import { BlogCategory, BlogPostSummary } from '../types/blog.types';
import { blogCategoryApiSlug, blogCategoryTitleFromParam, findBlogCategory } from './blog-category';
import { formatBlogDate } from './blog-date';
import { buildBlogFeedItems } from './blog-feed';
import { slugifyBlogCategory } from './blog-slug';

const categories: BlogCategory[] = [
  { id: '8', title: 'Kazak/Triko', slug: 'kazak' },
  { id: '10', title: 'Ceket (Dış Giyim)', slug: 'ceket-dis-giyim' },
  { id: '6', title: 'Ev Giyim', slug: 'ev-giyim' },
];

function post(overrides: Partial<BlogPostSummary>): BlogPostSummary {
  return {
    id: '1',
    slug: 'yazi-1',
    title: 'Yazı',
    excerpt: '',
    coverImage: null,
    coverImageAlt: '',
    categoryTitle: null,
    categorySlug: null,
    publishedAt: '',
    isHighlighted: false,
    ...overrides,
  };
}

describe('slugifyBlogCategory', () => {
  it('matches the web slug rules for Turkish characters and punctuation', () => {
    expect(slugifyBlogCategory('Kazak/Triko')).toBe('kazak-triko');
    expect(slugifyBlogCategory('Ceket (Dış Giyim)')).toBe('ceket-dis-giyim');
    expect(slugifyBlogCategory('Yaz Modası')).toBe('yaz-modasi');
    expect(slugifyBlogCategory('  Şık & Özel  ')).toBe('sik-ozel');
  });
});

describe('blog category helpers', () => {
  it('resolves both the API slug and the web title slug to the same category', () => {
    expect(findBlogCategory('kazak', categories)?.title).toBe('Kazak/Triko');
    expect(findBlogCategory('kazak-triko', categories)?.slug).toBe('kazak');
    expect(findBlogCategory('ceket-dis-giyim', categories)?.id).toBe('10');
    expect(findBlogCategory('bilinmeyen', categories)).toBeNull();
  });

  it('uses the API slug for filtering and falls back to the raw param', () => {
    expect(blogCategoryApiSlug('kazak-triko', categories)).toBe('kazak');
    expect(blogCategoryApiSlug('yeni-kategori', categories)).toBe('yeni-kategori');
  });

  it('builds a readable title when the category is unknown', () => {
    expect(blogCategoryTitleFromParam('ev-giyim', categories)).toBe('Ev Giyim');
    expect(blogCategoryTitleFromParam('yaz-modasi', categories)).toBe('yaz modasi');
  });
});

describe('formatBlogDate', () => {
  it('formats ISO dates in Turkey time with long Turkish month names', () => {
    expect(formatBlogDate('2026-10-01T12:46:28+03:00')).toBe('1 Ekim 2026');
    // 22:30 UTC is already the next day in Turkey.
    expect(formatBlogDate('2026-08-31T22:30:00Z')).toBe('1 Eylül 2026');
    expect(formatBlogDate('2026-07-21 13:53:56')).toBe('21 Temmuz 2026');
  });

  it('returns an empty string for missing or invalid dates', () => {
    expect(formatBlogDate('')).toBe('');
    expect(formatBlogDate(undefined)).toBe('');
    expect(formatBlogDate('dün')).toBe('');
  });
});

describe('buildBlogFeedItems', () => {
  it('puts the highlighted post first, then four compact and the rest standard', () => {
    const posts = Array.from({ length: 7 }, (_, index) =>
      post({ id: String(index + 1), slug: `yazi-${index + 1}`, isHighlighted: index === 2 }),
    );

    const items = buildBlogFeedItems(posts);

    expect(items.map((item) => [item.kind, item.post.id])).toEqual([
      ['featured', '3'],
      ['compact', '1'],
      ['compact', '2'],
      ['compact', '4'],
      ['compact', '5'],
      ['standard', '6'],
      ['standard', '7'],
    ]);
  });

  it('falls back to the first post and skips duplicates from shifted pages', () => {
    const items = buildBlogFeedItems([post({ id: '1' }), post({ id: '2' }), post({ id: '1' })]);
    expect(items.map((item) => [item.kind, item.post.id])).toEqual([
      ['featured', '1'],
      ['compact', '2'],
    ]);
  });

  it('returns no items for an empty list', () => {
    expect(buildBlogFeedItems([])).toEqual([]);
  });
});
