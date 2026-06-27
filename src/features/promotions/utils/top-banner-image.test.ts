import { resolveTopBannerImageUrl } from './top-banner-image';

describe('resolveTopBannerImageUrl', () => {
  it('returns absolute http(s) urls untouched', () => {
    expect(resolveTopBannerImageUrl('https://cdn.example.com/b.png')).toBe(
      'https://cdn.example.com/b.png',
    );
  });

  it('resolves banner storage paths against the CDN host', () => {
    expect(resolveTopBannerImageUrl('storage/top-banners/mobile/banner.jpg')).toBe(
      'https://cdn.haydigiy.com/storage/top-banners/mobile/banner.jpg',
    );
  });

  it('normalizes a leading slash without inserting an extra storage segment', () => {
    expect(resolveTopBannerImageUrl('/storage/top-banners/mobile/banner.jpg')).toBe(
      'https://cdn.haydigiy.com/storage/top-banners/mobile/banner.jpg',
    );
  });

  it('returns an empty string for missing paths', () => {
    expect(resolveTopBannerImageUrl(null)).toBe('');
    expect(resolveTopBannerImageUrl('')).toBe('');
  });
});
