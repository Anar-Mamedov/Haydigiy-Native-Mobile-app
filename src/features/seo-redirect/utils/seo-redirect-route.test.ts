import {
  readSeoRedirectHop,
  resolveSeoRedirectRoute,
  withSeoRedirectHop,
} from './seo-redirect-route';

// `isInAppLink` link-handler'dan gelir; o modül router'ı da içe aktarır.
jest.mock('expo-router', () => ({ router: {} }));

const CATEGORY_SOURCE = { path: '/kolye-kupe-bileklik', queryString: 'c=216' };
const PRODUCT_SOURCE = { path: '/eski-urun', queryString: '' };

describe('resolveSeoRedirectRoute', () => {
  it('maps a category target to the app listing route', () => {
    expect(resolveSeoRedirectRoute('/kadin-aksesuar?c=1', CATEGORY_SOURCE)).toBe('/kategori/kadin-aksesuar?c=1');
  });

  it('maps a product target to the app product route', () => {
    expect(resolveSeoRedirectRoute('/yeni-urun', PRODUCT_SOURCE)).toBe('/product/yeni-urun');
  });

  it.each(['https://haydigiy.com/kadin-aksesuar?c=1', 'https://www.haydigiy.com/kadin-aksesuar?c=1#ust'])(
    'accepts an absolute store address (%s)',
    (target) => {
      expect(resolveSeoRedirectRoute(target, CATEGORY_SOURCE)).toBe('/kategori/kadin-aksesuar?c=1');
    },
  );

  it('accepts a target without a leading slash', () => {
    expect(resolveSeoRedirectRoute('kadin-aksesuar?c=1', CATEGORY_SOURCE)).toBe('/kategori/kadin-aksesuar?c=1');
  });

  it('maps the store home page to the app home', () => {
    expect(resolveSeoRedirectRoute('https://haydigiy.com', PRODUCT_SOURCE)).toBe('/');
  });

  it.each([
    ['another domain', 'https://example.com/kampanya'],
    ['a non-web scheme', 'tel:+905555555555'],
    ['an empty target', '  '],
  ])('cannot follow %s', (_case, target) => {
    expect(resolveSeoRedirectRoute(target, PRODUCT_SOURCE)).toBeNull();
  });

  it('does not redirect a page to itself', () => {
    expect(resolveSeoRedirectRoute('/kolye-kupe-bileklik?c=216', CATEGORY_SOURCE)).toBeNull();
    expect(resolveSeoRedirectRoute('https://haydigiy.com/eski-urun', PRODUCT_SOURCE)).toBeNull();
  });
});

describe('seo redirect hops', () => {
  it('appends the hop count to the target route', () => {
    expect(withSeoRedirectHop('/kategori/kadin-aksesuar?c=1', 1)).toBe(
      '/kategori/kadin-aksesuar?c=1&seo_redirect_hop=1',
    );
    expect(withSeoRedirectHop('/product/yeni-urun', 2)).toBe('/product/yeni-urun?seo_redirect_hop=2');
  });

  it.each([
    [undefined, 0],
    ['', 0],
    ['abc', 0],
    ['-1', 0],
    ['1', 1],
    [['2', '5'], 2],
  ])('reads %p as %p hops', (value, expected) => {
    expect(readSeoRedirectHop(value)).toBe(expected);
  });
});
