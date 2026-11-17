import type { CategorySlugEntry, CategorySlugIndex } from '@/types/category-slug-index.types';
import { findCategoryCanonicalRoute, isCategoryCandidatePath } from './category-canonical-route';

function buildIndex(entries: CategorySlugEntry[]): CategorySlugIndex {
  return {
    byId: new Map(entries.map((entry) => [entry.id, entry])),
    bySlug: new Map(entries.map((entry) => [entry.slug, entry])),
  };
}

const INDEX = buildIndex([
  { id: 187, slug: 'kadin-elbise' },
  { id: 31, slug: 'kadin-buyuk-beden-3' },
  { id: 208, slug: 'yeni-gelenler' },
]);

describe('isCategoryCandidatePath', () => {
  it.each(['/kadin-elbise', '/kadin-buyuk-beden-3', '/urun-adi-12345'])('accepts the single-segment path %s', (path) => {
    expect(isCategoryCandidatePath(path)).toBe(true);
  });

  it.each(['/', '', '/s/123', '/blog/yazi', '/yeni-gelenler', '/cok-satanlar', '/sitemap.xml'])('rejects %s', (path) => {
    expect(isCategoryCandidatePath(path)).toBe(false);
  });
});

describe('findCategoryCanonicalRoute', () => {
  it('maps a category link without its id to the category listing', () => {
    expect(findCategoryCanonicalRoute({ path: '/kadin-elbise', queryString: '' }, INDEX)).toBe('/kategori/kadin-elbise?c=187');
  });

  it('keeps other query parameters such as sorting and tracking', () => {
    expect(findCategoryCanonicalRoute({ path: '/kadin-elbise', queryString: 'sorting=2&utm_source=x' }, INDEX)).toBe(
      '/kategori/kadin-elbise?c=187&sorting=2&utm_source=x',
    );
  });

  it('treats a category slug that ends with digits as a category', () => {
    expect(findCategoryCanonicalRoute({ path: '/kadin-buyuk-beden-3', queryString: '' }, INDEX)).toBe('/kategori/kadin-buyuk-beden-3?c=31');
  });

  it('moves a wrong slug with a valid category id to the canonical slug', () => {
    expect(findCategoryCanonicalRoute({ path: '/eski-kategori', queryString: 'c=187&page=2' }, INDEX)).toBe('/kategori/kadin-elbise?c=187&page=2');
  });

  it('does not redirect when the slug already matches the category id', () => {
    expect(findCategoryCanonicalRoute({ path: '/kadin-elbise', queryString: 'c=187' }, INDEX)).toBeNull();
  });

  it('does not treat a product link carrying a best-listing category id as a category', () => {
    expect(findCategoryCanonicalRoute({ path: '/siyah-elbise-76604148-105600', queryString: 'c=187&best=sales' }, INDEX)).toBeNull();
  });

  it('returns null for an unknown slug or an unknown category id', () => {
    expect(findCategoryCanonicalRoute({ path: '/olmayan-sayfa', queryString: '' }, INDEX)).toBeNull();
    expect(findCategoryCanonicalRoute({ path: '/olmayan-sayfa', queryString: 'c=999' }, INDEX)).toBeNull();
  });

  it('leaves menu listings alone even when the slug is also a category', () => {
    expect(findCategoryCanonicalRoute({ path: '/yeni-gelenler', queryString: '' }, INDEX)).toBeNull();
  });
});
