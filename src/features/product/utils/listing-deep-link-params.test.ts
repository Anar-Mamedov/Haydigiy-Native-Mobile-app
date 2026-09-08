import {
  buildProductListingKey,
  parseProductListingTarget,
} from './listing-deep-link-params';

describe('parseProductListingTarget', () => {
  it('reads the category id and the sorting choice from a filtered listing link', () => {
    // https://haydigiy.com/haydigiy-butik?c=147&sorting=4
    const target = parseProductListingTarget({ c: '147', sorting: '4' });

    expect(target.categoryId).toBe(147);
    expect(target.filters.sorting).toBe('4');
  });

  it('reads the query of a search link', () => {
    // https://haydigiy.com/search?q=55041.1397
    const target = parseProductListingTarget({ q: '55041.1397' });

    expect(target.searchQuery).toBe('55041.1397');
    expect(target.categoryId).toBeUndefined();
  });

  it('carries every listing filter the web URL can hold', () => {
    const target = parseProductListingTarget({
      c: '40',
      colors: 'siyah,beyaz',
      max_price: '900',
      min_price: '100',
      pc: '11,12',
      price_range: '100-900',
      property_ids: '5,6',
      q: 'elbise',
      sorting: '4',
      variants: '38,40',
    });

    expect(target).toEqual({
      categoryId: 40,
      searchQuery: 'elbise',
      filters: {
        colors: 'siyah,beyaz',
        maxPrice: '900',
        minPrice: '100',
        priceRange: '100-900',
        productCategories: '11,12',
        propertyIds: '5,6',
        sorting: '4',
        variants: '38,40',
      },
    });
  });

  it('accepts the API name for the product-category filter as a fallback', () => {
    expect(parseProductListingTarget({ product_categories: '11' }).filters.productCategories).toBe(
      '11',
    );
    // Web kısaltması gelirse o kazanır.
    expect(
      parseProductListingTarget({ pc: '11', product_categories: '99' }).filters.productCategories,
    ).toBe('11');
  });

  it('takes the first value when a key repeats in the URL', () => {
    const target = parseProductListingTarget({ c: ['147', '999'], sorting: ['4'] });

    expect(target.categoryId).toBe(147);
    expect(target.filters.sorting).toBe('4');
  });

  it('drops blank and non-numeric values instead of filtering by them', () => {
    const target = parseProductListingTarget({
      c: 'invalid',
      colors: '   ',
      q: '',
      sorting: undefined,
    });

    expect(target).toEqual({ categoryId: undefined, searchQuery: undefined, filters: {} });
  });

  it('rejects a zero or negative category id', () => {
    expect(parseProductListingTarget({ c: '0' }).categoryId).toBeUndefined();
    expect(parseProductListingTarget({ c: '-3' }).categoryId).toBeUndefined();
  });
});

describe('buildProductListingKey', () => {
  it('changes when the sorting choice changes so the screen re-seeds its state', () => {
    const unsorted = buildProductListingKey('haydigiy-butik', parseProductListingTarget({ c: '147' }));
    const sorted = buildProductListingKey(
      'haydigiy-butik',
      parseProductListingTarget({ c: '147', sorting: '4' }),
    );

    expect(sorted).not.toBe(unsorted);
  });

  it('changes between two searches on the same route', () => {
    const first = buildProductListingKey('search', parseProductListingTarget({ q: '55041.1397' }));
    const second = buildProductListingKey('search', parseProductListingTarget({ q: 'elbise' }));

    expect(second).not.toBe(first);
  });

  it('stays stable for the same target so the list is not remounted needlessly', () => {
    const target = { c: '147', sorting: '4' };

    expect(buildProductListingKey('haydigiy-butik', parseProductListingTarget(target))).toBe(
      buildProductListingKey('haydigiy-butik', parseProductListingTarget(target)),
    );
  });
});
