/**
 * Haydi Asistan bağlantı/medya doğrulayıcıları (README §6.7a, §6.7b, §7.1, §7.2).
 * Web (frontend/src/lib/assistant/assistantLinks.ts) ile aynı kurallar; sözleşme testi assistant-links.test.ts.
 * Kural: sunucudan gelen adres DEĞİŞTİRİLMEZ; yalnız doğrulanır, uymuyorsa çizilmez.
 */

export const DEFAULT_MEDIA_HOSTS = ['cdn.haydigiy.com', 'cdn.haydigiytr.com'];

const RELATIVE_HREF = /^\/(?![/\\])[^\s]*$/;
const FORBIDDEN_IN_HREF = /:\/\/|javascript:|data:|\\/i;
const WHATSAPP_HREF = /^https:\/\/wa\.me\/\d{8,15}(\?text=[^\s]*)?$/;
const IMAGE_URL = /^https:\/\/([A-Za-z0-9.-]+)\/[A-Za-z0-9._~/-]{1,200}\.(jpe?g|png|webp|gif)$/i;
const VIDEO_URL = /^https:\/\/([A-Za-z0-9.-]+)\/[A-Za-z0-9._~/-]{1,200}\.(mp4|webm)$/i;

/** link_button href'i: tek "/" ile başlayan göreli yol; şema, "//", "\" ve boşluk yok. */
export const isSafeRelativeHref = (href: unknown): href is string => {
  if (typeof href !== 'string' || href.length === 0 || href.length > 1024) return false;
  return RELATIVE_HREF.test(href) && !FORBIDDEN_IN_HREF.test(href);
};

export const isSafeWhatsappHref = (href: unknown): href is string => {
  return typeof href === 'string' && href.length <= 2048 && WHATSAPP_HREF.test(href);
};

const normalizeHosts = (hosts: readonly string[] | null | undefined): string[] => {
  const list = (hosts ?? []).filter((host) => typeof host === 'string' && host.length > 0);
  return (list.length > 0 ? list : DEFAULT_MEDIA_HOSTS).map((host) => host.toLowerCase());
};

const isSafeMediaUrl = (
  url: unknown,
  pattern: RegExp,
  hosts: readonly string[] | null | undefined,
): boolean => {
  if (typeof url !== 'string' || url.length > 300 || url.includes('..')) return false;
  const match = pattern.exec(url);
  if (!match) return false;
  return normalizeHosts(hosts).includes(match[1].toLowerCase());
};

export const isSafeImageUrl = (url: unknown, hosts?: readonly string[] | null): url is string =>
  isSafeMediaUrl(url, IMAGE_URL, hosts);

export const isSafeVideoUrl = (url: unknown, hosts?: readonly string[] | null): url is string =>
  isSafeMediaUrl(url, VIDEO_URL, hosts);

/** Hangi bağlantı açılır: karar TIKLAMA anında viewport'a göre verilir (≥1024 px masaüstü). */
export const pickHref = (href: { desktop: string; mobile: string }, isDesktopViewport: boolean): string =>
  isDesktopViewport ? href.desktop : href.mobile;
