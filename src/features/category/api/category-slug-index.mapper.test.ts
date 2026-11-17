import { mapCategorySlugIndex } from './category-slug-index.mapper';

describe('mapCategorySlugIndex', () => {
  it('indexes nested categories by id and slug', () => {
    const index = mapCategorySlugIndex([
      { id: 201, slug: 'kadin', children: [{ id: '187', slug: ' kadin-elbise ', children: [{ id: 31, slug: 'kadin-buyuk-beden-3' }] }] },
    ]);

    expect(index.byId.get(187)).toEqual({ id: 187, slug: 'kadin-elbise' });
    expect(index.bySlug.get('kadin-buyuk-beden-3')).toEqual({ id: 31, slug: 'kadin-buyuk-beden-3' });
    expect(index.byId.size).toBe(3);
  });

  it('keeps the first category for a repeated slug, like the web', () => {
    const index = mapCategorySlugIndex([
      { id: 1, slug: 'tekrar' },
      { id: 2, slug: 'tekrar' },
    ]);

    expect(index.bySlug.get('tekrar')).toEqual({ id: 1, slug: 'tekrar' });
    expect(index.byId.get(2)).toEqual({ id: 2, slug: 'tekrar' });
  });

  it('skips invalid nodes but still visits their children', () => {
    const index = mapCategorySlugIndex([
      { id: null, slug: 'kimliksiz', children: [{ id: 5, slug: 'alt' }] },
      { id: 0, slug: 'sifir' },
      { id: 6, slug: '' },
      { id: 'abc', slug: 'gecersiz' },
    ]);

    expect([...index.byId.keys()]).toEqual([5]);
    expect(index.bySlug.has('kimliksiz')).toBe(false);
  });

  it('returns empty indexes for a missing tree', () => {
    expect(mapCategorySlugIndex(undefined).byId.size).toBe(0);
    expect(mapCategorySlugIndex(null).bySlug.size).toBe(0);
  });
});
