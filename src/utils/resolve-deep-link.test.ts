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

  it('maps a root-level web category link to the category listing route', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/haydigiy-butik?c=147')).toBe(
      '/kategori/haydigiy-butik?c=147',
    );
    expect(resolveDeepLinkPath('/haydigiy-butik?c=147')).toBe(
      '/kategori/haydigiy-butik?c=147',
    );
    expect(resolveDeepLinkPath('haydigiywebviewapp://haydigiy-butik?c=147')).toBe(
      '/kategori/haydigiy-butik?c=147',
    );
  });

  it('does not mistake an invalid category marker for a category link', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/spor-ayakkabi-123?c=invalid')).toBe(
      '/product/spor-ayakkabi-123',
    );
  });

  it('passes through paths that are already app routes', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/product/abc-1')).toBe('/product/abc-1');
    expect(resolveDeepLinkPath('/order/42')).toBe('/order/42');
  });

  it.each([
    ['/hesabim', '/profile'],
    ['/hesabim/kullaniciBilgileri', '/user-info'],
    ['/hesabim/adreslerim', '/addresses'],
    ['/hesabim/odemeBilgileri', '/payment-methods'],
    ['/hesabim/sifre-degistir', '/change-password'],
    ['/hesabim/siparislerim', '/orders'],
    ['/hesabim/siparislerim/940225', '/order/940225'],
    ['/hesabim/iade-olustur/940225', '/return-create/940225'],
    ['/hesabim/siparis-iptal/940225', '/order-cancel/940225'],
    ['/hesabim/degerlendirmelerim', '/reviews'],
    ['/hesabim/kuponlarim', '/coupons'],
    ['/hesabim/gezdiklerim', '/gezdiklerim'],
    ['/hesabim/sozlesmeler', '/agreements'],
    ['/hesabim/yardim', '/help'],
    ['/hesabim/bildirimlerim', '/orders'],
    ['/hesabim/duyurular', '/user-info'],
    ['/hesabim/geri-bildirim', '/help'],
  ])('maps the web account path %s to %s', (webPath, appPath) => {
    expect(resolveDeepLinkPath(`https://haydigiy.com${webPath}`)).toBe(appPath);
  });

  it('maps mobile-web account aliases and address form links', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/m/hesabim')).toBe('/profile');
    expect(resolveDeepLinkPath('https://haydigiy.com/m/hesabim/hesap')).toBe('/profile');
    expect(resolveDeepLinkPath('https://haydigiy.com/m/hesabim/adreslerim/ekle')).toBe(
      '/address-form',
    );
    expect(resolveDeepLinkPath('https://haydigiy.com/m/hesabim/adreslerim/52')).toBe(
      '/address-form?id=52',
    );
    expect(resolveDeepLinkPath('haydigiywebviewapp://hesabim/siparislerim/940225')).toBe(
      '/order/940225',
    );
  });

  it('preserves query parameters on web account order links', () => {
    expect(
      resolveDeepLinkPath('https://haydigiy.com/hesabim/siparislerim?category=cancelled'),
    ).toBe('/orders?category=cancelled');
    expect(
      resolveDeepLinkPath('https://haydigiy.com/hesabim/siparis-iptal/940225?select_all=1'),
    ).toBe('/order-cancel/940225?select_all=1');
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
    expect(resolveDeepLinkPath('https://haydigiy.com/banka-hesabimiz')).toBe('/bank-account');
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
