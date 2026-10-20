import type { WebLocation } from '@/types/seo-redirect.types';
import { isInAppLink } from '@/utils/link-handler';
import { resolveDeepLinkPath } from '@/utils/resolve-deep-link';

/**
 * SEO yönlendirme kuralının hedefi (`target_url`) bir web adresidir
 * (`/kadin-aksesuar?c=1` ya da mutlak haydigiy.com adresi). Uygulamada derin
 * bağlantılarla aynı eşlemeden (`resolveDeepLinkPath`) geçer:
 * `/kadin-aksesuar?c=1` → `/kategori/kadin-aksesuar?c=1`.
 *
 * Zincirleme ya da döngüsel kurallar (A → B, B → A) ekranları sonsuza dek
 * değiştirmesin diye izlenen yönlendirme sayısı hedef rotada taşınır.
 */

/** Hedef rotaya eklenen ve kaçıncı yönlendirme olduğunu taşıyan parametre. */
export const SEO_REDIRECT_HOP_PARAM = 'seo_redirect_hop';

/** Bir açılışta izlenecek en fazla yönlendirme; sonrası 404 ekranıdır. */
export const MAX_SEO_REDIRECT_HOPS = 2;

const HTTP_ORIGIN = /^https?:\/\/[^/?#]+/i;
const ANY_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function formatWebLocation({ path, queryString }: WebLocation): string {
  return queryString ? `${path}?${queryString}` : path;
}

/** Hedefi `/yol?sorgu` biçimine getirir; mağaza dışı adres ve şemalar için `null`. */
function toStoreWebPath(targetUrl: string): string | null {
  let target = targetUrl.trim();
  if (!target) return null;

  if (HTTP_ORIGIN.test(target)) {
    // Başka bir alan adına giden kural uygulama içinde açılamaz.
    if (!isInAppLink(target)) return null;
    target = target.replace(HTTP_ORIGIN, '');
  } else if (ANY_SCHEME.test(target)) {
    return null;
  }

  const withoutHash = target.split('#')[0];
  if (!withoutHash) return '/';
  return withoutHash.startsWith('/') ? withoutHash : `/${withoutHash}`;
}

/**
 * Kuralın hedefini uygulama rotasına çevirir. Hedef açılamıyorsa ya da istenen
 * adresin kendisiyse (hatalı kural, web'deki döngü korumasıyla aynı) `null` döner.
 */
export function resolveSeoRedirectRoute(targetUrl: string, source: WebLocation): string | null {
  const targetPath = toStoreWebPath(targetUrl);
  if (!targetPath || targetPath === formatWebLocation(source)) return null;

  return resolveDeepLinkPath(targetPath);
}

/** Rota parametresinden izlenen yönlendirme sayısı; yoksa ya da geçersizse 0. */
export function readSeoRedirectHop(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

export function withSeoRedirectHop(route: string, hop: number): string {
  const separator = route.includes('?') ? '&' : '?';
  return `${route}${separator}${SEO_REDIRECT_HOP_PARAM}=${hop}`;
}
