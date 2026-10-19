import { DEFAULT_MEDIA_HOSTS, isSafeWhatsappHref } from '../utils/assistant-links';
import { compareVersions } from '../utils/assistant-version';
import { resolveAssistantTexts } from '../utils/assistant-texts';
import type { AssistantConfig, AssistantFallback } from '@/types/assistant.types';

/**
 * Uygulama istemcisinin uyguladığı sözleşme sürümü ve desteklediği en yüksek şema sürümü (README §4.1).
 * `widget_min_version` acil kapatma yoludur: sunucu bundan büyük bir değer gönderirse giriş noktası gizlenir.
 */
export const ASSISTANT_WIDGET_VERSION = '1.1.0';
export const ASSISTANT_SCHEMA_VERSION = 1;

const DEFAULT_FALLBACK: AssistantFallback = {
  error_text: "Şu an bir sorun yaşıyorum 😔 Lütfen biraz sonra tekrar deneyin ya da Canlı Destek'ten yazın.",
  live_support: {
    label: '💬 Canlı Destek',
    href: 'https://wa.me/905327805100',
    number_label: '+90 532 780 51 00',
  },
};

type Raw = Record<string, unknown>;

const asRecord = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {});
const hostList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((host): host is string => typeof host === 'string' && host.length > 0)
    : [];

export const parseFallback = (value: unknown): AssistantFallback => {
  const raw = asRecord(value);
  const live = asRecord(raw.live_support);
  return {
    error_text:
      typeof raw.error_text === 'string' && raw.error_text ? raw.error_text : DEFAULT_FALLBACK.error_text,
    live_support: {
      label: typeof live.label === 'string' && live.label ? live.label : DEFAULT_FALLBACK.live_support.label,
      href: isSafeWhatsappHref(live.href) ? live.href : DEFAULT_FALLBACK.live_support.href,
      number_label:
        typeof live.number_label === 'string' && live.number_label
          ? live.number_label
          : DEFAULT_FALLBACK.live_support.number_label,
    },
  };
};

/**
 * `/config` gövdesini okur. Desteklenmeyen şema ya da eski widget → `enabled:false`
 * (launcher sessizce çizilmez, kural 13).
 */
export const parseAssistantConfig = (value: unknown): AssistantConfig => {
  const raw = asRecord(value);
  const schemaVersion = typeof raw.schema_version === 'number' ? raw.schema_version : 0;
  const widgetMinVersion = typeof raw.widget_min_version === 'string' ? raw.widget_min_version : '0.0.0';
  const supported = schemaVersion > 0 && schemaVersion <= ASSISTANT_SCHEMA_VERSION;
  const versionOk = compareVersions(ASSISTANT_WIDGET_VERSION, widgetMinVersion) >= 0;
  const limits = asRecord(raw.limits);
  const imageHosts = hostList(raw.image_hosts);
  const videoHosts = hostList(raw.video_hosts);
  return {
    enabled: raw.enabled === true && supported && versionOk,
    schemaVersion,
    widgetMinVersion,
    maxText: typeof limits.max_text === 'number' && limits.max_text > 0 ? limits.max_text : 500,
    imageHosts: imageHosts.length > 0 ? imageHosts : DEFAULT_MEDIA_HOSTS,
    videoHosts: videoHosts.length > 0 ? videoHosts : DEFAULT_MEDIA_HOSTS,
    fallback: parseFallback(raw.fallback),
    texts: resolveAssistantTexts(raw.texts),
  };
};

export const DEFAULT_ASSISTANT_FALLBACK = DEFAULT_FALLBACK;
