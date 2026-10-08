import { type Href, router } from 'expo-router';
import { Linking } from 'react-native';
import { resolveDeepLinkPath } from './resolve-deep-link';

/**
 * Banner, hikâye, vitrin ve kategori menüsü bağlantılarını açar.
 *
 * CMS bağlantıları web yollarıdır (`/elbise?c=40`, `/s/123`, `/hakkimizda`,
 * `/blog/...`) ya da mutlak haydigiy.com adresleridir. Hepsi derin bağlantılarla
 * aynı eşlemeden (`resolveDeepLinkPath`) geçer; böylece bir banner ile paylaşılan
 * aynı link aynı ekranı açar. Eskiden her bilinmeyen yol kategori listesine
 * düşüyordu: ürün slug'ı boş liste, `/blog/abc` "abc" kategorisi, kök `/` tüm
 * ürünler olarak açılıyordu.
 *
 * Yalnızca mağaza dışındaki adresler (sosyal medya, `tel:`, `mailto:`) cihazda
 * dışarıda açılır.
 */

/** iOS Universal Links / Android App Links ile uygulamanın sahiplendiği alan adları (app.json). */
const STORE_HOSTS = new Set(['haydigiy.com', 'www.haydigiy.com']);
const APP_SCHEME = 'haydigiywebviewapp:';
const IGNORED_LINKS = new Set(['#', 'javascript:void(0)']);
const HOME_PATH = '/';

/** `https://kullanici@haydigiy.com:443/yol` → `haydigiy.com`; http(s) değilse `null`. */
function readHttpHost(link: string): string | null {
  const match = link.match(/^https?:\/\/([^/?#]+)/i);
  if (!match) return null;

  const authority = match[1];
  const host = authority.slice(authority.lastIndexOf('@') + 1).split(':')[0];
  return host.toLowerCase();
}

/** Bağlantı uygulama içinde mi açılmalı? Şemasız yollar ve mağaza adresleri evet. */
export function isInAppLink(link: string): boolean {
  const host = readHttpHost(link);
  if (host !== null) return STORE_HOSTS.has(host);

  if (link.toLowerCase().startsWith(APP_SCHEME)) return true;

  // `tel:`, `mailto:`, `whatsapp:` gibi diğer şemalar cihaz uygulamalarına aittir.
  return !/^[a-z][a-z0-9+.-]*:/i.test(link);
}

export function handleLinkPress(link: string | null | undefined) {
  const trimmed = link?.trim();
  if (!trimmed || IGNORED_LINKS.has(trimmed)) {
    return;
  }

  if (!isInAppLink(trimmed)) {
    Linking.openURL(trimmed).catch((err) =>
      console.warn('Failed to open external link:', trimmed, err)
    );
    return;
  }

  // Şemasız CMS yolları ("elbise?c=40") da kök yol olarak yorumlanır.
  const path = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith('/')
    ? trimmed
    : `/${trimmed}`;

  const target = resolveDeepLinkPath(path);

  // Ana sayfa hedefi (kök `/` ya da app karşılığı olmayan web sayfası) üst üste
  // ikinci bir ana sayfa açmamalı; yığında varsa ona dönülür.
  if (target === HOME_PATH) {
    router.dismissTo(HOME_PATH as Href);
    return;
  }

  router.push(target as Href);
}
