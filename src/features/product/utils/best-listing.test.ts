import { BEST_LISTING_OPTIONS, buildBestListingRoute, parseBestListingValue } from './best-listing';

describe('best listing', () => {
  it('offers the three web popularity lists in web order', () => {
    expect(BEST_LISTING_OPTIONS.map((option) => option.label)).toEqual([
      'En Çok Satılanlar',
      'En Çok Ziyaret Edilenler',
      'En Çok Favorilenenler',
    ]);
  });

  it.each([
    ['sales', 'sales'],
    ['views', 'views'],
    ['favorites', 'favorites'],
    [['views', 'sales'], 'views'],
    ['reviews', undefined],
    ['', undefined],
    [undefined, undefined],
  ])('parses %p as %p', (value, expected) => {
    expect(parseBestListingValue(value as string | string[] | undefined)).toBe(expected);
  });

  it('switches lists with only the category and the list, like the web links', () => {
    expect(buildBestListingRoute('kadin-buyuk-beden-elbise', 40, 'views')).toBe(
      '/kategori/kadin-buyuk-beden-elbise?c=40&best=views',
    );
    expect(buildBestListingRoute('cok-satanlar', undefined, 'sales')).toBe('/kategori/cok-satanlar?best=sales');
  });
});
