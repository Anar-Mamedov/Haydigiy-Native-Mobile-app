import { resolveDeepLinkPath } from '@/utils/resolve-deep-link';
import { isSafeRelativeHref } from './assistant-links';

/**
 * `link_button` adresleri sitenin WEB yollarıdır (sözleşme web için yazıldı). Uygulamada her adres
 * bir native ekrana çevrilir; karşılığı olmayan sayfa uygulama içi tarayıcıda sitede açılır.
 *
 * - Hesap sayfaları `/giris?returnUrl=…` (ya da `/hizli-giris`) sarmalıyla gelir: girişliyse sarmal
 *   açılıp hedef ekrana gidilir; misafirse giriş formunun bulunduğu Hesabım ekranı açılır (girişsiz
 *   sipariş ekranları boş bekliyordu, bu yüzden hedefe hiç gidilmez).
 * - `/kayit-ol`, `/sifremi-unuttum` gibi giriş akışı sayfaları uygulamada Hesabım ekranının içindedir.
 * - Genel çözücüde (`resolveDeepLinkPath`) karşılığı eksik iki yol burada eşlenir: mobil iptal sayfası
 *   `/m/siparis-iptal/{id}` ve `/hesabim/sorularim`.
 * Sunucu adresi DEĞİŞTİRİLMEZ; yalnız okunur. Ölçüm işareti `src=haydi-asistan` sorguda kalır.
 */
export const SITE_ORIGIN = 'https://www.haydigiy.com';

export type AssistantLinkTarget = { type: 'route'; path: string } | { type: 'web'; url: string };

const LOGIN_WRAPPERS = new Set(['giris', 'hizli-giris']);
const GUEST_AUTH_PAGES = new Set(['kayit-ol', 'uye-ol', 'sifremi-unuttum', 'telefon-ile-giris']);
const PROFILE_PATH = '/profile';
const MAX_UNWRAP_DEPTH = 2;

const route = (path: string): AssistantLinkTarget => ({ type: 'route', path });

const splitHref = (href: string) => {
  const queryIndex = href.indexOf('?');
  return {
    segments: (queryIndex >= 0 ? href.slice(0, queryIndex) : href).split('/').filter(Boolean),
    search: queryIndex >= 0 ? href.slice(queryIndex) : '',
  };
};

const readQueryParam = (search: string, key: string): string | null => {
  for (const pair of search.replace(/^\?/, '').split('&')) {
    const [name, value = ''] = pair.split('=');
    if (name !== key) continue;
    try {
      return decodeURIComponent(value);
    } catch {
      return null;
    }
  }
  return null;
};

/** Genel çözücüde eksik kalan, asistanın gönderdiği iki web yolu. */
const resolveKnownGaps = (segments: string[], search: string): string | null => {
  const lower = segments.map((segment) => segment.toLowerCase());
  if (lower.length === 3 && lower[0] === 'm' && lower[1] === 'siparis-iptal' && /^\d+$/.test(lower[2])) {
    return `/order-cancel/${lower[2]}${search}`;
  }
  const accountTail = lower[0] === 'm' ? lower.slice(1) : lower;
  if (accountTail.length === 2 && accountTail[0] === 'hesabim' && accountTail[1] === 'sorularim')
    return '/questions';
  return null;
};

export function resolveAssistantLinkTarget(
  href: string,
  isAuthenticated: boolean,
  depth = 0,
): AssistantLinkTarget {
  if (!isSafeRelativeHref(href)) return route(PROFILE_PATH);
  const { segments, search } = splitHref(href);
  const first = segments[0]?.toLowerCase() ?? '';

  if (LOGIN_WRAPPERS.has(first)) {
    const returnUrl = readQueryParam(search, 'returnUrl');
    if (!isAuthenticated || !returnUrl || depth >= MAX_UNWRAP_DEPTH || !isSafeRelativeHref(returnUrl)) {
      return route(PROFILE_PATH);
    }
    const inner = resolveAssistantLinkTarget(returnUrl, isAuthenticated, depth + 1);
    return inner.type === 'route' && inner.path === '/' ? route(PROFILE_PATH) : inner;
  }
  if (GUEST_AUTH_PAGES.has(first)) return route(PROFILE_PATH);

  const gap = resolveKnownGaps(segments, search);
  if (gap) return route(gap);

  const resolved = resolveDeepLinkPath(href);
  // Genel çözücü tanımadığı yolu ana ekrana düşürür; asistan bağlantısı kaybolmasın diye sitede açılır.
  if (resolved === '/' && segments.length > 0) return { type: 'web', url: `${SITE_ORIGIN}${href}` };
  return route(resolved);
}
