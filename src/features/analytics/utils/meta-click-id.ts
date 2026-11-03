/**
 * Meta reklam tıklama kimliği (`fbclid`) ayrıştırma ve `fbc` biçimi.
 *
 * Instagram/Facebook reklamı uygulamayı iki yoldan açar:
 * - Universal/App Link: `https://haydigiy.com/...?fbclid=...` doğrudan gelir.
 * - Meta App Links (web `metaAppLinks.ts`, `haydigiywebviewapp:///?to=...`): Meta tıklama
 *   kimliğini `al_applink_data` JSON'undaki `target_url` içine koyar.
 *
 * Saf modüldür: depolama ve süre yönetimi `meta-click-id-store`'un işidir.
 */

/** Meta'nın değeri belgelenmiş bir alfabe değil; makul karakter ve uzunlukla sınırlanır. */
const FBCLID_PATTERN = /^[A-Za-z0-9._-]{8,400}$/;
const FBCLID_PARAM = /[?&#]fbclid=([^&#]*)/;
const APP_LINK_DATA_PARAM = /[?&#]al_applink_data=([^&#]*)/;

function readParam(url: string, pattern: RegExp): string | null {
  const raw = url.match(pattern)?.[1];
  if (!raw) return null;

  try {
    return decodeURIComponent(raw.replace(/\+/g, ' '));
  } catch {
    return null;
  }
}

function validFbclid(value: string | null): string | null {
  const trimmed = value?.trim() ?? '';
  return FBCLID_PATTERN.test(trimmed) ? trimmed : null;
}

function readAppLinkTargetUrl(url: string): string | null {
  const data = readParam(url, APP_LINK_DATA_PARAM);
  if (!data) return null;

  try {
    const parsed: unknown = JSON.parse(data);
    const targetUrl =
      parsed !== null && typeof parsed === 'object'
        ? (parsed as { target_url?: unknown }).target_url
        : undefined;
    return typeof targetUrl === 'string' ? targetUrl : null;
  } catch {
    return null;
  }
}

/** Açılış URL'sindeki `fbclid`; yoksa ya da geçersizse null. */
export function extractFbclid(url: string | null | undefined): string | null {
  if (!url) return null;

  const direct = validFbclid(readParam(url, FBCLID_PARAM));
  if (direct) return direct;

  const targetUrl = readAppLinkTargetUrl(url);
  return targetUrl ? validFbclid(readParam(targetUrl, FBCLID_PARAM)) : null;
}

/**
 * Meta `fbc` biçimi: `fb.<alt alan dizini>.<ilk görülme zamanı ms>.<fbclid>`.
 * Alt alan dizini web `_fbc` çereziyle aynı (`1`).
 */
export function buildFbc(fbclid: string, createdAtMs: number): string {
  return `fb.1.${Math.trunc(createdAtMs)}.${fbclid}`;
}
