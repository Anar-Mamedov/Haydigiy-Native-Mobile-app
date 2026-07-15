/**
 * Frontend'deki `/hesabim` ve `/m/hesabim` yollarını mevcut native hesap
 * ekranlarına eşler. Bu tablo web route adlarını Expo Router ayrıntılarından
 * ayırarak hesap URL sözleşmesini tek yerde tutar.
 */

const STATIC_ACCOUNT_ROUTES: Record<string, string> = {
  hesap: '/profile',
  kullanicibilgileri: '/user-info',
  adreslerim: '/addresses',
  odemebilgileri: '/payment-methods',
  'sifre-degistir': '/change-password',
  siparislerim: '/orders',
  degerlendirmelerim: '/reviews',
  kuponlarim: '/coupons',
  gezdiklerim: '/gezdiklerim',
  sozlesmeler: '/agreements',
  yardim: '/help',

  // Frontend bu sayfayı masaüstünde zaten siparişlere yönlendiriyor.
  bildirimlerim: '/orders',
  // Native'de henüz ayrı tercih ve genel geri bildirim ekranları bulunmuyor.
  // Kullanıcıyı aynı alanın en yakın işlevsel ekranında tut.
  duyurular: '/user-info',
  'geri-bildirim': '/help',
};

const DYNAMIC_ACCOUNT_ROUTES: Record<string, string> = {
  siparislerim: '/order',
  'iade-olustur': '/return-create',
  'siparis-iptal': '/order-cancel',
};

function getAccountSegments(segments: string[]): string[] | null {
  if (segments[0]?.toLowerCase() === 'hesabim') return segments.slice(1);
  if (
    segments[0]?.toLowerCase() === 'm' &&
    segments[1]?.toLowerCase() === 'hesabim'
  ) {
    return segments.slice(2);
  }
  return null;
}

function withSearch(path: string, search: string): string {
  return `${path}${search}`;
}

function addressFormPath(id: string, search: string): string {
  const existingQuery = search.startsWith('?') ? search.slice(1) : search;
  const suffix = existingQuery ? `&${existingQuery}` : '';
  return `/address-form?id=${encodeURIComponent(id)}${suffix}`;
}

/** Tanınan hesap URL'sini native rotaya, hesap dışı yolu `null` değerine çevirir. */
export function resolveAccountDeepLinkPath(
  segments: string[],
  search: string,
): string | null {
  const accountSegments = getAccountSegments(segments);
  if (!accountSegments) return null;
  if (accountSegments.length === 0) return withSearch('/profile', search);

  const page = accountSegments[0].toLowerCase();

  if (accountSegments.length === 1) {
    const staticRoute = STATIC_ACCOUNT_ROUTES[page];
    return staticRoute ? withSearch(staticRoute, search) : '/profile';
  }

  if (page === 'adreslerim' && accountSegments.length === 2) {
    const addressTarget = accountSegments[1];
    if (addressTarget.toLowerCase() === 'ekle') return withSearch('/address-form', search);
    return addressFormPath(addressTarget, search);
  }

  const dynamicRoute = DYNAMIC_ACCOUNT_ROUTES[page];
  if (dynamicRoute && accountSegments.length === 2 && accountSegments[1]) {
    return withSearch(`${dynamicRoute}/${accountSegments[1]}`, search);
  }

  // Yeni veya artık desteklenmeyen bir hesap alt yolu +not-found'a düşmesin.
  return '/profile';
}
