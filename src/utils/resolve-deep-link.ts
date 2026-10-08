import { resolveAccountDeepLinkPath } from './resolve-account-deep-link';

/**
 * Gelen derin bağlantı URL'ini (iOS Universal Links, Android App Links veya
 * `haydigiywebviewapp://` custom scheme) uygulama rotasına çevirir.
 *
 * Web (haydigiy.com) ile uygulama rota yapıları farklıdır:
 *   web  haydigiy.com/{slug}               →  app  /product/{slug}
 *   web  haydigiy.com/{slug}?c={id}        →  app  /kategori/{slug}?c={id}
 *   web  haydigiy.com/{slug}?menu_url={m}  →  app  /kategori/{slug}?menu_url={m}
 *   web  haydigiy.com/cok-satanlar         →  app  /kategori/cok-satanlar?menu_url=cok-satanlar
 *   web  haydigiy.com/kategori/{slug}      →  app  /kategori/{slug}
 *   web  haydigiy.com/search?q=...         →  app  /kategori/search?q=...
 *   web  haydigiy.com/s/{tedarikçiKodu}    →  app  /s/{tedarikçiKodu}
 *   web  haydigiy.com/blog[/...]           →  app  /blog[/...]
 *   web  haydigiy.com/hakkimizda vb.       →  app  /bilgi/{slug}
 *   web  haydigiy.com/yardim?kategori=...  →  app  /help?kategori=...
 *   web  haydigiy.com/hesabim/... → app'teki ilgili hesap ekranı
 * Bu yüzden gelen yol burada eşlenir. Tanınmayan her şey güvenli biçimde ana
 * ekrana (`/`) düşer; asla +not-found'a gitmez.
 *
 * Liste yollarında sorgu dizesi olduğu gibi taşınır; sıralama ve filtre
 * seçimleri (`sorting`, `colors`, `pc`, ...) böylece uygulamada da uygulanır.
 *
 * RN'in `URL`/`URLSearchParams` API'si Hermes'te güvenilmez olduğundan
 * (bkz. features/checkout/utils/parse-query.ts) parse manuel yapılır.
 */

/** Uygulamada zaten var olan, olduğu gibi geçirilecek üst-seviye rotalar. */
const APP_ROUTE_ROOTS = new Set([
  'cart',
  'favorites',
  'orders',
  'categories',
  'product',
  'kategori',
  'order',
  'order-cancel',
  'return-create',
  'checkout',
  'sifremi-sifirla',
  'bilgi',
]);

/** Expo'nun development build'i başlatmak için kullandığı, app rotası olmayan yollar. */
const RESERVED_NATIVE_ROOTS = new Set(['expo-development-client']);

/**
 * Web'in arama sonucu yolu. Uygulamada ayrı bir arama rotası yoktur; arama da
 * ürün listesi ekranıdır ve uygulama içi arama ile aynı `search` slug'ını
 * kullanır (bkz. search-suggestions-screen, link-handler).
 */
const WEB_SEARCH_ROOTS = new Set(['search', 'search-products']);
const APP_SEARCH_PATH = '/kategori/search';

/** Web blog kökü; app'te aynı yapıda `/blog` rotaları vardır. */
const BLOG_ROOT = 'blog';
/** Blog altında makale olmayan web yolları (RSS vb.) → blog ana sayfası. */
const BLOG_NON_ARTICLE_SEGMENTS = new Set(['feed.xml']);

/** Web tedarikçi listesi kökü (`/s/{kod}`); app'te de aynı yoldur. */
const SUPPLIER_ROOT = 's';

/**
 * Web bilgi ve sözleşme sayfaları. App'te `/bilgi/{slug}` altında web ile aynı
 * slug'la açılır (bkz. features/info-pages/routes). Web `/m/hakkimizda` gibi
 * mobil-web takma adları da aynı ekrana gider.
 */
const WEB_INFO_PAGE_ROOTS = new Set([
  'cerez-politikasi',
  'hakkimizda',
  'iptal-iade-kosullari',
  'islem-rehberi',
  'kisisel-verilerin-korunmasi',
  'kullanim-kosullari',
  'subeden-al',
  'uyelik-sozlesmesi',
]);
const APP_INFO_PAGE_ROOT = '/bilgi';

/**
 * Web'de `c` olmadan da menü tabanlı liste olan özel sayfalar; web bunları
 * `menu_url={slug}` ile listeler (bkz. frontend `src/app/[slug]/page.tsx`).
 */
const WEB_MENU_LISTING_ROOTS = new Set(['cok-satanlar', 'yeni-gelenler', 'indirimdekiler']);

/** Yardım sayfası; web `?kategori=` ile açılacak SSS kategorisini seçer. */
const WEB_HELP_ROOT = 'yardim';
const APP_HELP_PATH = '/help';
/** Web "İade & Değişim" sayfası, yardımın iptal-iade kategorisidir. */
const WEB_RETURN_HELP_ROOT = 'iade-degisim';
const RETURN_HELP_CATEGORY = 'iptal-iade';

/** Web kök yolu → app rotası (app karşılığı olan ticari sayfalar). */
const WEB_TO_APP: Record<string, string> = {
  sepet: '/cart',
  'favori-listem': '/favorites',
  profile: '/profile',
  kategoriler: '/categories',
  'banka-hesabimiz': '/bank-account',
};

/**
 * Web'de ürün OLMAYAN kök segmentler. Ürün slug'ı ile karışmamaları için burada
 * listelenir; app karşılığı olmadığından ana ekrana düşerler. Web'in kök rotaları
 * değişirse burası güncellenmelidir.
 */
const RESERVED_WEB_ROOTS = new Set([
  'api',
  'cache-temizle',
  'dogrulama',
  'error',
  'favicon.ico',
  'garanti',
  'giris',
  'guncelle',
  'hizli-giris',
  'iletisim',
  'indir',
  'isbank',
  'kariyer',
  'kayit-ol',
  'llms.txt',
  'm',
  'misyon-vizyon',
  'not-found-page',
  'odeme',
  'odeme-basarili',
  'odeme-basarisiz',
  'odememesaj',
  'payten',
  'paytr',
  'robots.txt',
  'sayfa-tasarimi',
  'sentry-example-page',
  'sitemap-images.xml',
  'sitemap-main.xml',
  'sitemap-urunler',
  'sitemap.xml',
  'sifremi-unuttum',
  'soru',
  'surocevaplar',
  'telefon-ile-giris',
  'uye-ol',
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

/** Sorgu dizesinin başına `key=value` ekler; mevcut parametreler korunur. */
function prependQueryParam(search: string, key: string, value: string): string {
  const query = search.startsWith('?') ? search.slice(1) : search;
  const pair = `${key}=${encodeURIComponent(value)}`;
  return `?${query ? `${pair}&${query}` : pair}`;
}

/** Yalnızca `kategori` parametresini taşıyan yardım yolu (utm vb. atılır). */
function helpPath(category: string | null): string {
  return category ? `${APP_HELP_PATH}?kategori=${encodeURIComponent(category)}` : APP_HELP_PATH;
}

/** `/blog`, `/blog/{slug}`, `/blog/kategori/{kategori}`; diğer her şey blog ana sayfası. */
function resolveBlogPath(segments: string[]): string {
  const [, second, third] = segments;
  if (!second) return '/blog';

  if (second.toLowerCase() === 'kategori') {
    return third && segments.length === 3 ? `/blog/kategori/${third}` : '/blog';
  }

  if (segments.length === 2 && !BLOG_NON_ARTICLE_SEGMENTS.has(second.toLowerCase())) {
    return `/blog/${second}`;
  }
  return '/blog';
}

/** Web tedarikçi listesi; kod web'deki gibi yalnızca rakam olmalıdır. */
function resolveSupplierPath(segments: string[], search: string): string {
  const code = segments[1];
  if (segments.length !== 2 || !code || !/^\d+$/.test(code)) return '/';
  return `/s/${code}${search}`;
}

/** Bilgi/sözleşme sayfası (`/hakkimizda`, `/m/hakkimizda`) ise app yolunu döndürür. */
function resolveInfoPagePath(segments: string[]): string | null {
  const isMobileWebAlias = segments[0].toLowerCase() === 'm' && segments.length === 2;
  const pageSegments = isMobileWebAlias ? segments.slice(1) : segments;
  if (pageSegments.length !== 1) return null;

  const slug = pageSegments[0].toLowerCase();
  return WEB_INFO_PAGE_ROOTS.has(slug) ? `${APP_INFO_PAGE_ROOT}/${slug}` : null;
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

    // Development client'ın manifest URL'ini ürün slug'ı gibi yorumlama.
    if (RESERVED_NATIVE_ROOTS.has(first)) return '/';

    // Zaten app rotası olan üst-seviye yollar → alt yol + query ile geçir.
    if (APP_ROUTE_ROOTS.has(first)) {
      return `/${segments.join('/')}${search}`;
    }

    // Web araması app'te ürün listesi ekranıdır; sorgu dizesi (`q` ve varsa
    // sıralama/filtreler) olduğu gibi taşınır.
    if (WEB_SEARCH_ROOTS.has(first)) return `${APP_SEARCH_PATH}${search}`;

    // Blog yolları app'te aynı yapıdadır; ürün slug'ı sanılmamalı.
    if (first === BLOG_ROOT) return resolveBlogPath(segments);

    // Tedarikçi listesi (`/s/{kod}`); sıralama/filtre sorgusu taşınır.
    if (first === SUPPLIER_ROOT) return resolveSupplierPath(segments, search);

    // Frontend hesap yollarını genel web eşlemelerinden önce çöz.
    const accountPath = resolveAccountDeepLinkPath(segments, search);
    if (accountPath) return accountPath;

    // Bilgi ve sözleşme sayfaları (`/m/` takma adları dahil).
    const infoPagePath = resolveInfoPagePath(segments);
    if (infoPagePath) return infoPagePath;

    // Yardım: web'in seçtiği SSS kategorisi korunur.
    if (first === WEB_HELP_ROOT) return helpPath(getQueryParam(search, 'kategori'));
    if (first === WEB_RETURN_HELP_ROOT) return helpPath(RETURN_HELP_CATEGORY);

    // Bilinen web → app eşlemesi.
    if (WEB_TO_APP[first]) return WEB_TO_APP[first];

    // Rezerve web sayfaları (app karşılığı yok) → ana ekran.
    if (RESERVED_WEB_ROOTS.has(first)) return '/';

    // Buradan sonrası yalnızca kök seviyedeki tek segmentli web sayfalarıdır;
    // tanınmayan çok segmentli yollar ürün sanılmaz.
    if (segments.length > 1) return '/';

    // Web kategori sayfaları da ürünler gibi kök seviyededir; `c` parametresi
    // sayfanın kategori kimliğidir. Uygulamadaki liste rotasına taşı.
    const categoryId = getQueryParam(search, 'c');
    if (categoryId && /^[1-9]\d*$/.test(categoryId)) {
      return `/kategori/${segments[0]}${search}`;
    }

    // Menü tabanlı liste: `menu_url` taşıyan bağlantı ya da web'in `c`
    // olmadan listelediği özel sayfa (`/cok-satanlar`).
    if (getQueryParam(search, 'menu_url')) return `/kategori/${segments[0]}${search}`;
    if (WEB_MENU_LISTING_ROOTS.has(first)) {
      return `/kategori/${segments[0]}${prependQueryParam(search, 'menu_url', first)}`;
    }

    // Kök seviyede tek segment ve rezerve değil → ürün slug'ı.
    return `/product/${segments[0]}`;
  } catch {
    return '/';
  }
}
