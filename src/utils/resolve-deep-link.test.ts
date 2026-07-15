import { resolveDeepLinkPath } from './resolve-deep-link';

describe('resolveDeepLinkPath', () => {
  it('maps the storefront root to the app home', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com')).toBe('/');
    expect(resolveDeepLinkPath('')).toBe('/');
  });

  it('maps a root-level product slug to the product route', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/spor-ayakkabi-123')).toBe(
      '/product/spor-ayakkabi-123',
    );
    expect(resolveDeepLinkPath('https://www.haydigiy.com/elbise-xyz')).toBe('/product/elbise-xyz');
  });

  it('passes through category links unchanged', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/kategori/kadin-giyim')).toBe(
      '/kategori/kadin-giyim',
    );
  });

  it('passes through paths that are already app routes', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/product/abc-1')).toBe('/product/abc-1');
    expect(resolveDeepLinkPath('/order/42')).toBe('/order/42');
  });

  it('preserves the password-reset token and opens the native reset route', () => {
    expect(
      resolveDeepLinkPath('https://haydigiy.com/sifremi-sifirla?token=reset-token-123'),
    ).toBe('/sifremi-sifirla?token=reset-token-123');
    expect(resolveDeepLinkPath('/sifremi-sifirla?token=reset-token-123')).toBe(
      '/sifremi-sifirla?token=reset-token-123',
    );
    expect(
      resolveDeepLinkPath('haydigiywebviewapp://sifremi-sifirla?token=reset-token-123'),
    ).toBe('/sifremi-sifirla?token=reset-token-123');
  });

  it('rewrites known web pages to their app equivalents', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/sepet')).toBe('/cart');
    expect(resolveDeepLinkPath('https://haydigiy.com/favori-listem')).toBe('/favorites');
    expect(resolveDeepLinkPath('https://haydigiy.com/kategoriler')).toBe('/categories');
    expect(resolveDeepLinkPath('https://haydigiy.com/hesabim')).toBe('/profile');
  });

  it('sends reserved web-only pages to the home screen', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/giris')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/odeme-basarili')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/sitemap.xml')).toBe('/');
  });

  it('resolves the banner custom-scheme `to` parameter', () => {
    expect(resolveDeepLinkPath('haydigiywebviewapp:///?to=%2Fspor-ayakkabi-123')).toBe(
      '/product/spor-ayakkabi-123',
    );
    expect(resolveDeepLinkPath('haydigiywebviewapp:///?to=%2Fkategori%2Fkadin')).toBe(
      '/kategori/kadin',
    );
  });

  it('opens the home screen for a bare custom-scheme launch', () => {
    expect(resolveDeepLinkPath('haydigiywebviewapp://')).toBe('/');
  });

  it('never throws on malformed input and falls back safely', () => {
    expect(() => resolveDeepLinkPath('%%%not-a-url%%%')).not.toThrow();
    expect(() => resolveDeepLinkPath('haydigiywebviewapp:///?to=%E0%A4%A')).not.toThrow();
    expect(resolveDeepLinkPath('   ')).toBe('/');
  });
});
