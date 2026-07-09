/**
 * Gelen derin bağlantı URL'ini (iOS Universal Links, Android App Links veya
 * `haydigiywebviewapp://` custom scheme) uygulama rotasına çevirir.
 *
 * Web (haydigiy.com) ile uygulama rota yapıları farklıdır:
 *   web  haydigiy.com/{slug}          →  app  /product/{slug}
 *   web  haydigiy.com/kategori/{slug} →  app  /kategori/{slug}
 * Bu yüzden gelen yol burada eşlenir. Tanınmayan her şey güvenli biçimde ana
 * ekrana (`/`) düşer; asla +not-found'a gitmez.
 *
 * RN'in `URL`/`URLSearchParams` API'si Hermes'te güvenilmez olduğundan
 * (bkz. features/checkout/utils/parse-query.ts) parse manuel yapılır.
 */

/** Uygulamada zaten var olan, olduğu gibi geçirilecek üst-seviye rotalar. */
const APP_ROUTE_ROOTS = new Set([
  'product',
  'kategori',
  'order',
  'order-cancel',
  'return-create',
  'checkout',
]);

/** Web kök yolu → app rotası (app karşılığı olan ticari sayfalar). */
const WEB_TO_APP: Record<string, string> = {
  sepet: '/cart',
  'favori-listem': '/favorites',
  hesabim: '/profile',
  profile: '/profile',
  kategoriler: '/categories',
  yardim: '/help',
};

/**
 * Web'de ürün OLMAYAN kök segmentler. Ürün slug'ı ile karışmamaları için burada
 * listelenir; app karşılığı olmadığından ana ekrana düşerler. Web'in kök rotaları
 * değişirse burası güncellenmelidir.
 */
const RESERVED_WEB_ROOTS = new Set([
  'banka-hesabimiz',
  'cache-temizle',
  'cerez-politikasi',
  'dogrulama',
  'error',
  'garanti',
  'giris',
  'guncelle',
  'hakkimizda',
  'hizli-giris',
  'iade-degisim',
  'iletisim',
  'iptal-iade-kosullari',
  'isbank',
  'islem-rehberi',
  'kariyer',
  'kayit-ol',
  'kisisel-verilerin-korunmasi',
  'kullanim-kosullari',
  'm',
  'misyon-vizyon',
  'not-found-page',
  'odeme',
  'odeme-basarili',
  'odeme-basarisiz',
  'odememesaj',
  'payten',
  'paytr',
  'sayfa-tasarimi',
  'search',
  'sentry-example-page',
  'sitemap-main.xml',
  'sitemap-urunler',
  'sitemap.xml',
  'sifremi-sifirla',
  'sifremi-unuttum',
  'soru',
  'surocevaplar',
  'telefon-ile-giris',
  'uye-ol',
  'uyelik-sozlesmesi',
  'yapim-asamasinda',
  'yorum',
]);

interface Target {
  segments: string[];
  search: string;
}

function segmentsOf(pathname: string): string[] {
  return pathname.split('/').filter(Boolean);
}

/** Şema + host'u atıp `/path?query` biçimini döndürür. */
function stripScheme(input: string): string {
  const schemeMatch = input.match(/^[a-z][a-z0-9+.-]*:\/\//i);
  if (!schemeMatch) return input;

  const afterScheme = input.slice(schemeMatch[0].length);
  if (/^https?:\/\//i.test(input)) {
    // http(s): gerçek host'u at, ilk '/'den itibaren al.
    const slash = afterScheme.indexOf('/');
    return slash >= 0 ? afterScheme.slice(slash) : '/';
  }
  // custom scheme: host yoktur, kalanı yol kabul et.
  return `/${afterScheme}`;
}

function getQueryParam(search: string, key: string): string | null {
  const query = search.startsWith('?') ? search.slice(1) : search;
  if (!query) return null;

  for (const pair of query.split('&')) {
    const eq = pair.indexOf('=');
    const currentKey = eq >= 0 ? pair.slice(0, eq) : pair;
    if (currentKey === key) {
      const value = eq >= 0 ? pair.slice(eq + 1) : '';
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

function readTarget(input: string): Target {
  const raw = (input || '').trim();
  if (!raw) return { segments: [], search: '' };

  const pathAndQuery = stripScheme(raw);
  const qIndex = pathAndQuery.indexOf('?');
  const pathname = qIndex >= 0 ? pathAndQuery.slice(0, qIndex) : pathAndQuery;
  const search = qIndex >= 0 ? pathAndQuery.slice(qIndex) : '';
  const segments = segmentsOf(pathname);

  // Banner custom-scheme deseni: kök yol + `to` → gerçek hedef `to`'dadır.
  if (segments.length === 0 && search) {
    const to = getQueryParam(search, 'to');
    if (to) return readTarget(to);
  }

  return { segments, search };
}

/** Gelen derin bağlantıyı uygulama rotasına çevirir. */
export function resolveDeepLinkPath(input: string): string {
  try {
    const { segments, search } = readTarget(input);
    if (segments.length === 0) return '/';

    const first = segments[0].toLowerCase();

    // Zaten app rotası olan üst-seviye yollar → alt yol + query ile geçir.
    if (APP_ROUTE_ROOTS.has(first)) {
      return `/${segments.join('/')}${search}`;
    }

    // Bilinen web → app eşlemesi.
    if (WEB_TO_APP[first]) return WEB_TO_APP[first];

    // Rezerve web sayfaları (app karşılığı yok) → ana ekran.
    if (RESERVED_WEB_ROOTS.has(first)) return '/';

    // Kök seviyede tek segment ve rezerve değil → ürün slug'ı.
    return `/product/${segments[0]}`;
  } catch {
    return '/';
  }
}
