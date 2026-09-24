import insiderConfig from '../../../../insider.config.json';
import { InsiderCallbackType, InsiderPayload, InsiderPushAction } from '../types/insider.types';
import { resolveInsiderScreen } from './insider-screen';

const TRUSTED_WEB_PREFIXES = ['https://haydigiy.com', 'https://www.haydigiy.com'];
const APP_SCHEME_PREFIX = 'haydigiywebviewapp://';
const INSIDER_SCHEME_PREFIX = `insider${insiderConfig.partnerName.toLowerCase()}://`;

function readObject(value: unknown): InsiderPayload | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as InsiderPayload)
    : null;
}

function readJson(value: unknown): InsiderPayload | null {
  if (typeof value !== 'string') return readObject(value);
  try {
    return readObject(JSON.parse(value));
  } catch {
    return null;
  }
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
  const data = readObject(payload?.data) ?? readObject(payload);
  return data ? resolveDeepLinkData(data, 0) : null;
}

function resolveDeepLinkData(data: InsiderPayload, depth: number): InsiderPushAction {
  // Only inspect the SDK's clicked target, never the first item in an advanced push.
  // Bound nested JSON to tolerate malformed/cyclic input without breaking SDK callbacks.
  if (depth > 4) return null;
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

  const json = readJson(data.ins_dl_json);
  const jsonAction = json ? resolveDeepLinkData(json, depth + 1) : null;
  if (jsonAction) return jsonAction;

  const screen = resolveInsiderScreen(data);
  return screen ? { type: 'internal', url: screen } : null;
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
