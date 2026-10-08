import { buildBlogProductRoute, parseBlogPrice, productSlugFromUrl } from './blog-product';

describe('parseBlogPrice', () => {
  it.each([
    ['349,99 TL', 349.99],
    ['1.249,99 TL', 1249.99],
    ['849 TL', 849],
    ['349.99', 349.99],
    ['1.249', 1249],
    ['', 0],
    [null, 0],
    [120, 120],
  ])('parses %p as %p', (input, expected) => {
    expect(parseBlogPrice(input as string | number | null)).toBe(expected);
  });
});

describe('productSlugFromUrl', () => {
  it('takes the last path segment of web product URLs', () => {
    expect(productSlugFromUrl('https://haydigiy.com/madonna-yaka-triko-kazak-pembe-720401765-100119')).toBe(
      'madonna-yaka-triko-kazak-pembe-720401765-100119',
    );
    expect(productSlugFromUrl('https://haydigiy.com/product/elbise-1?ref=blog#top')).toBe('elbise-1');
    expect(productSlugFromUrl('/elbise-2/')).toBe('elbise-2');
    expect(productSlugFromUrl('')).toBe('');
  });
});

describe('buildBlogProductRoute', () => {
  it('opens the product detail by slug with preview params', () => {
    expect(
      buildBlogProductRoute({
        id: '100119',
        name: 'Madonna Yaka Triko Kazak',
        priceLabel: '349,99 TL',
        price: 349.99,
        slug: 'madonna-yaka-triko-kazak-pembe-720401765-100119',
        imageUrl: 'https://cdn.haydigiy.com/k.webp',
      }),
    ).toEqual({
      pathname: '/product/[id]',
      params: expect.objectContaining({
        id: 'madonna-yaka-triko-kazak-pembe-720401765-100119',
        imageUrl: 'https://cdn.haydigiy.com/k.webp',
        price: '349.99',
        title: 'Madonna Yaka Triko Kazak',
      }),
    });
  });
});
