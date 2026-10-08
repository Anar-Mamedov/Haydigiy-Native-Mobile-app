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

  it('opens web search results on the app listing screen instead of the home tab', () => {
    // Paylaşılan arama linki uygulamada ana ekrana düşüyordu; `search` kökü
    // rezerve listesindeydi. Uygulama içi arama da aynı `search` slug'ını kullanır.
    expect(resolveDeepLinkPath('https://haydigiy.com/search?q=55041.1397')).toBe(
      '/kategori/search?q=55041.1397',
    );
    expect(resolveDeepLinkPath('/search?q=elbise')).toBe('/kategori/search?q=elbise');
  });

  it('keeps sorting and filter selections on shared listing links', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/haydigiy-butik?c=147&sorting=4')).toBe(
      '/kategori/haydigiy-butik?c=147&sorting=4',
    );
    expect(
      resolveDeepLinkPath('https://haydigiy.com/search?q=elbise&sorting=4&colors=siyah'),
    ).toBe('/kategori/search?q=elbise&sorting=4&colors=siyah');
    expect(
      resolveDeepLinkPath('https://haydigiy.com/kategori/kadin-giyim?c=40&pc=11&price_range=100-900'),
    ).toBe('/kategori/kadin-giyim?c=40&pc=11&price_range=100-900');
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

  it.each(['cart', 'favorites', 'orders', 'categories'])(
    'opens native %s notification links instead of treating them as product slugs',
    (path) => {
      expect(resolveDeepLinkPath(`/${path}`)).toBe(`/${path}`);
      expect(resolveDeepLinkPath(`haydigiywebviewapp://${path}`)).toBe(`/${path}`);
      expect(resolveDeepLinkPath(`https://haydigiy.com/${path}`)).toBe(`/${path}`);
    },
  );

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
    ['/hesabim/duyurular', '/announcement-preferences'],
    ['/hesabim/geri-bildirim', '/feedback'],
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

  it('opens the supplier listing instead of a product named "s"', () => {
    // Regresyon: `/s/123` → `/product/s` açılıyordu.
    expect(resolveDeepLinkPath('https://haydigiy.com/s/123')).toBe('/s/123');
    expect(resolveDeepLinkPath('https://haydigiy.com/s/123?sorting=4&colors=siyah')).toBe(
      '/s/123?sorting=4&colors=siyah',
    );
    expect(resolveDeepLinkPath('haydigiywebviewapp://s/123')).toBe('/s/123');
  });

  it('sends invalid supplier links home like the web 404 instead of a product', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/s')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/s/abc')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/s/12/extra')).toBe('/');
  });

  it.each([
    ['/blog', '/blog'],
    ['/blog/', '/blog'],
    ['/blog/kis-kombin-onerileri', '/blog/kis-kombin-onerileri'],
    ['/blog/kategori/moda', '/blog/kategori/moda'],
    ['/blog/kategori', '/blog'],
    ['/blog/feed.xml', '/blog'],
    ['/blog/a/b', '/blog'],
    ['/blog/kis-kombin-onerileri?utm_source=instagram', '/blog/kis-kombin-onerileri'],
  ])('maps the web blog path %s to %s instead of a product', (webPath, appPath) => {
    // Regresyon: `/blog/abc` → `/product/blog` açılıyordu.
    expect(resolveDeepLinkPath(`https://haydigiy.com${webPath}`)).toBe(appPath);
  });

  it.each([
    'hakkimizda',
    'islem-rehberi',
    'iptal-iade-kosullari',
    'uyelik-sozlesmesi',
    'subeden-al',
    'cerez-politikasi',
    'kisisel-verilerin-korunmasi',
    'kullanim-kosullari',
  ])('opens the /%s info page on its app screen', (slug) => {
    // Regresyon: bilgi sayfaları ana ekrana, `/subeden-al` ürün ekranına düşüyordu.
    expect(resolveDeepLinkPath(`https://haydigiy.com/${slug}`)).toBe(`/bilgi/${slug}`);
    expect(resolveDeepLinkPath(`haydigiywebviewapp://${slug}`)).toBe(`/bilgi/${slug}`);
  });

  it('opens info pages from mobile-web aliases, any letter case and app links', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/m/hakkimizda')).toBe('/bilgi/hakkimizda');
    expect(resolveDeepLinkPath('https://haydigiy.com/HAKKIMIZDA')).toBe('/bilgi/hakkimizda');
    expect(resolveDeepLinkPath('https://haydigiy.com/subeden-al?utm_source=sms')).toBe(
      '/bilgi/subeden-al',
    );
    expect(resolveDeepLinkPath('haydigiywebviewapp://bilgi/islem-rehberi')).toBe(
      '/bilgi/islem-rehberi',
    );
  });

  it('keeps web-only pages without an app screen on the home screen', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/kariyer')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/misyon-vizyon')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/iletisim')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/m/kategori')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/api/health')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/robots.txt')).toBe('/');
  });

  it('opens the help screen on the FAQ category chosen by the web link', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/yardim')).toBe('/help');
    expect(resolveDeepLinkPath('https://haydigiy.com/yardim?kategori=iptal-iade')).toBe(
      '/help?kategori=iptal-iade',
    );
    expect(resolveDeepLinkPath('https://haydigiy.com/yardim?utm_source=x&kategori=odeme')).toBe(
      '/help?kategori=odeme',
    );
    // Web "İade & Değişim" sayfası yardımın iptal-iade kategorisidir.
    expect(resolveDeepLinkPath('https://haydigiy.com/iade-degisim')).toBe(
      '/help?kategori=iptal-iade',
    );
  });

  it('opens menu-based listings instead of treating them as products', () => {
    // Regresyon: yalnızca `menu_url` taşıyan bağlantı ürün sanılıyordu.
    expect(resolveDeepLinkPath('https://haydigiy.com/firsatlar?menu_url=firsatlar')).toBe(
      '/kategori/firsatlar?menu_url=firsatlar',
    );
    expect(resolveDeepLinkPath('https://haydigiy.com/cok-satanlar')).toBe(
      '/kategori/cok-satanlar?menu_url=cok-satanlar',
    );
    expect(resolveDeepLinkPath('https://haydigiy.com/yeni-gelenler?sorting=4')).toBe(
      '/kategori/yeni-gelenler?menu_url=yeni-gelenler&sorting=4',
    );
    // `c` varsa web de kategori olarak listeler.
    expect(resolveDeepLinkPath('https://haydigiy.com/indirimdekiler?c=300')).toBe(
      '/kategori/indirimdekiler?c=300',
    );
  });

  it('never turns an unknown multi-segment web path into a product', () => {
    expect(resolveDeepLinkPath('https://haydigiy.com/bilinmeyen/yol')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/spor-ayakkabi-123/yorumlar')).toBe('/');
  });

  it('treats the legacy search-products path as a search', () => {
    expect(resolveDeepLinkPath('/search-products?q=elbise')).toBe('/kategori/search?q=elbise');
  });

  it('opens the home screen for the app-download QR link', () => {
    // Basılı QR `haydigiy.com/indir` taşır. Uygulama yüklüyse App Links isteği
    // ağa çıkmadan yakalar; `indir` rezerve edilmemişken ürün slug'ı sanılıp
    // `/product/indir`e gidiyor ve 404 ekranı açılıyordu.
    expect(resolveDeepLinkPath('https://haydigiy.com/indir')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/indir?utm_source=qr')).toBe('/');
    expect(resolveDeepLinkPath('https://haydigiy.com/INDIR')).toBe('/');
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

  it('ignores Expo development-client launcher URLs instead of treating them as products', () => {
    const manifestUrl = encodeURIComponent('http://192.168.1.10:8081');

    expect(
      resolveDeepLinkPath(
        `haydigiywebviewapp://expo-development-client/?url=${manifestUrl}`,
      ),
    ).toBe('/');
    expect(
      resolveDeepLinkPath(
        `exp+haydigiy-webview-app://expo-development-client/?url=${manifestUrl}`,
      ),
    ).toBe('/');
  });

  it('never throws on malformed input and falls back safely', () => {
    expect(() => resolveDeepLinkPath('%%%not-a-url%%%')).not.toThrow();
    expect(() => resolveDeepLinkPath('haydigiywebviewapp:///?to=%E0%A4%A')).not.toThrow();
    expect(resolveDeepLinkPath('   ')).toBe('/');
  });
});
