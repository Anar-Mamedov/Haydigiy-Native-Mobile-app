import insiderConfig from '../../../../insider.config.json';
import { InsiderPayload, InsiderPushAction } from '../types/insider.types';

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
