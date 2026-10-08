import { resolveDeepLinkPath } from '@/utils/resolve-deep-link';

export type BlogLinkTarget =
  | { type: 'internal'; path: string }
  | { type: 'external'; url: string }
  | null;

const HAYDIGIY_WEB_URL = /^https?:\/\/(www\.)?haydigiy\.com(?=[/?#]|$)/i;

/**
 * Yazı içindeki bağlantının nereye açılacağını belirler.
 *
 * - haydigiy.com ve `/yol` bağlantıları uygulama içinde kalır; blog, ürün,
 *   kategori ve hesap yolları ortak derin bağlantı eşlemesiyle native rotaya çevrilir.
 * - Diğer `http(s)`, `mailto:` ve `tel:` adresleri sistemde açılır.
 * - Geri kalan her şey (`javascript:`, `//başka-alan`, `#çapa` ...) yok sayılır.
 */
export function resolveBlogLinkTarget(href: string | null | undefined): BlogLinkTarget {
  const value = href?.trim();
  if (!value) return null;

  const isAppPath = value.startsWith('/') && !value.startsWith('//');
  if (isAppPath || HAYDIGIY_WEB_URL.test(value)) {
    return { type: 'internal', path: resolveDeepLinkPath(value) };
  }

  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return { type: 'external', url: value };
  return null;
}
