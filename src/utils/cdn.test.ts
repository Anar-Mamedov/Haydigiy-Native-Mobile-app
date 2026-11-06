import { resolveCdnUrl, selectProductImageVariant } from '@/utils/cdn';

const BANNER = 'https://cdn.haydigiy.com/banners/12d200e2.webp';
const PRODUCT_MEDIUM = 'https://cdn.haydigiy.com/uploads/2026/01/30/m1_201381884_053/medium/pantolon_0.webp';

describe('resolveCdnUrl', () => {
  it('prefixes relative paths and keeps absolute URLs', () => {
    expect(resolveCdnUrl('/uploads/a.webp')).toBe('https://cdn.haydigiy.com/uploads/a.webp');
    expect(resolveCdnUrl('https://example.com/a.webp')).toBe('https://example.com/a.webp');
    expect(resolveCdnUrl('  ')).toBeNull();
  });
});

describe('selectProductImageVariant', () => {
  it('picks the smallest pre-generated variant that covers the card', () => {
    expect(selectProductImageVariant(PRODUCT_MEDIUM, 150)).toBe(PRODUCT_MEDIUM.replace('/medium/', '/thumb/'));
    expect(selectProductImageVariant(PRODUCT_MEDIUM, 389)).toBe(PRODUCT_MEDIUM);
    expect(selectProductImageVariant(PRODUCT_MEDIUM, 900)).toBe(PRODUCT_MEDIUM.replace('/medium/', '/large/'));
  });

  it('downsizes the large catalog image sent by Insider', () => {
    const large = PRODUCT_MEDIUM.replace('/medium/', '/large/');
    expect(selectProductImageVariant(large, 363)).toBe(PRODUCT_MEDIUM);
  });

  it('leaves URLs without a variant segment untouched', () => {
    expect(selectProductImageVariant(BANNER, 200)).toBe(BANNER);
    expect(selectProductImageVariant('https://cdn.haydigiy.com/uploads/no-image.jpg', 200)).toBe(
      'https://cdn.haydigiy.com/uploads/no-image.jpg',
    );
    expect(selectProductImageVariant('https://example.com/uploads/x/medium/a.webp', 150)).toBe(
      'https://example.com/uploads/x/medium/a.webp',
    );
  });

  it('only rewrites the variant directory, not a file name containing the word', () => {
    const url = 'https://cdn.haydigiy.com/uploads/2026/01/medium/large-elbise.webp';
    expect(selectProductImageVariant(url, 150)).toBe('https://cdn.haydigiy.com/uploads/2026/01/thumb/large-elbise.webp');
  });
});
