import insiderConfig from '../../../../insider.config.json';
import { InsiderCallbackType, InsiderPayload, InsiderPushAction } from '../types/insider.types';

const TRUSTED_WEB_PREFIXES = ['https://haydigiy.com', 'https://www.haydigiy.com'];
const APP_SCHEME_PREFIX = 'haydigiywebviewapp://';
const INSIDER_SCHEME_PREFIX = `insider${insiderConfig.partnerName.toLowerCase()}://`;

function readPayloadData(payload: InsiderPayload): InsiderPayload {
  const nestedData = payload.data;
  return nestedData && typeof nestedData === 'object' && !Array.isArray(nestedData)
    ? (nestedData as InsiderPayload)
    : payload;
}

function readString(payload: InsiderPayload, key: string): string | null {
  const value = payload[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function isInsiderSdkUrl(url: string): boolean {
  return url.trim().toLowerCase().startsWith(INSIDER_SCHEME_PREFIX);
}

export function isHaydigiyUniversalLink(url: string): boolean {
  const normalizedUrl = url.trim().toLowerCase();
  return TRUSTED_WEB_PREFIXES.some(
    (prefix) => normalizedUrl === prefix || normalizedUrl.startsWith(`${prefix}/`),
  );
}

export function isTrustedAppUrl(url: string): boolean {
  const normalizedUrl = url.trim().toLowerCase();
  return (
    (normalizedUrl.startsWith('/') && !normalizedUrl.startsWith('//')) ||
    normalizedUrl.startsWith(APP_SCHEME_PREFIX) ||
    isHaydigiyUniversalLink(normalizedUrl)
  );
}

export function resolveInsiderPushAction(payload: InsiderPayload): InsiderPushAction {
  const data = readPayloadData(payload);
  const internalUrl = readString(data, 'ins_dl_internal');

  if (internalUrl && isTrustedAppUrl(internalUrl)) {
    return { type: 'internal', url: internalUrl };
  }

  const urlScheme = readString(data, 'ins_dl_url_scheme');
  if (urlScheme && isTrustedAppUrl(urlScheme)) {
    return { type: 'internal', url: urlScheme };
  }

  const externalUrl = readString(data, 'ins_dl_external');
  if (externalUrl && /^https:\/\//i.test(externalUrl)) {
    return { type: 'external', url: externalUrl };
  }

  return null;
}

/**
 * Yönlendirme taşıyan callback tipleri. Push açılışı ve InApp buton tıklaması
 * aynı `ins_dl_*` alanlarını gönderir, dolayısıyla ikisi de aynı yönlendirmeyi
 * tetiklemelidir.
 *
 * Yalnızca NOTIFICATION_OPEN dinlendiğinde InApp pop-up'ındaki butona basılınca
 * hiçbir şey olmuyordu: SDK hedefi INAPP_BUTTON_CLICK ile veriyor ve bu callback
 * sessizce düşüyordu.
 */
const DEEP_LINK_CALLBACK_TYPES: readonly number[] = [
  InsiderCallbackType.NOTIFICATION_OPEN,
  InsiderCallbackType.INAPP_BUTTON_CLICK,
];

/**
 * Bir SDK callback'i için yapılması gereken yönlendirmeyi çözer.
 * Yönlendirme taşımayan tipler (INAPP_SEEN, SESSION_STARTED, TEMP_STORE_*) için `null` döner.
 */
export function resolveInsiderCallbackAction(
  type: number,
  payload: InsiderPayload,
): InsiderPushAction {
  if (!DEEP_LINK_CALLBACK_TYPES.includes(type)) return null;
  return resolveInsiderPushAction(payload);
}
