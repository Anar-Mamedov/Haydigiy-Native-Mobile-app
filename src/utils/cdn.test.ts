import {
  buildResizedCdnImageUrl,
  pickResizedImageWidth,
  resolveCdnUrl,
  selectProductImageVariant,
} from '@/utils/cdn';

const BANNER = 'https://cdn.haydigiy.com/banners/12d200e2.webp';
const PRODUCT_MEDIUM = 'https://cdn.haydigiy.com/uploads/2026/01/30/m1_201381884_053/medium/pantolon_0.webp';

describe('resolveCdnUrl', () => {
  it('prefixes relative paths and keeps absolute URLs', () => {
    expect(resolveCdnUrl('/uploads/a.webp')).toBe('https://cdn.haydigiy.com/uploads/a.webp');
    expect(resolveCdnUrl('https://example.com/a.webp')).toBe('https://example.com/a.webp');
    expect(resolveCdnUrl('  ')).toBeNull();
  });
});

describe('pickResizedImageWidth', () => {
  it('rounds up to the smallest bucket that covers the requested pixels', () => {
    expect(pickResizedImageWidth(1)).toBe(160);
    expect(pickResizedImageWidth(160)).toBe(160);
    expect(pickResizedImageWidth(481.2)).toBe(640);
    expect(pickResizedImageWidth(977)).toBe(1080);
  });

  it('caps at the largest bucket', () => {
    expect(pickResizedImageWidth(4000)).toBe(1280);
  });
});

describe('buildResizedCdnImageUrl', () => {
  it('requests a view-sized WebP through Cloudflare Image Resizing', () => {
    expect(buildResizedCdnImageUrl(BANNER, 481)).toBe(
      'https://cdn.haydigiy.com/cdn-cgi/image/width=640,quality=80,format=webp,fit=scale-down/banners/12d200e2.webp',
    );
  });

  it('leaves URLs outside the resizing zone untouched', () => {
    const placeholder = 'https://placehold.co/1200x400/94a3b8/fff?text=Yeni+Banner';
    expect(buildResizedCdnImageUrl(placeholder, 480)).toBe(placeholder);
  });

  it('does not wrap an already transformed URL twice', () => {
    const transformed = 'https://cdn.haydigiy.com/cdn-cgi/image/width=320/banners/a.webp';
    expect(buildResizedCdnImageUrl(transformed, 480)).toBe(transformed);
  });

  it('skips vector and animated sources', () => {
    expect(buildResizedCdnImageUrl('https://cdn.haydigiy.com/banners/a.svg', 480)).toBe(
      'https://cdn.haydigiy.com/banners/a.svg',
    );
    expect(buildResizedCdnImageUrl('https://cdn.haydigiy.com/banners/a.GIF', 480)).toBe(
      'https://cdn.haydigiy.com/banners/a.GIF',
    );
  });

  it('keeps the original when the width is unknown', () => {
    expect(buildResizedCdnImageUrl(BANNER, 0)).toBe(BANNER);
    expect(buildResizedCdnImageUrl(BANNER, Number.NaN)).toBe(BANNER);
  });

  it('returns null for empty input', () => {
    expect(buildResizedCdnImageUrl(null, 480)).toBeNull();
    expect(buildResizedCdnImageUrl(' ', 480)).toBeNull();
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
