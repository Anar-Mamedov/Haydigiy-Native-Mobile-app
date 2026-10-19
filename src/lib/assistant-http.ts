import axios from 'axios';
import { appEnv, getRequiredApiBaseUrl } from '@/lib/env';

/**
 * Haydi Asistan uçları için AYRI axios istemcisi (connect `/api/assistant/*`).
 *
 * Paylaşılan `apiClient` her isteğe site token'ını (`Authorization`) ve `X-Frontend-Key`'i ekler;
 * asistan sözleşmesinde site token'ı YALNIZ `POST /session`'da gider, diğer uçlarda asistanın kendi
 * kısa ömürlü token'ı (`X-Assistant-Token`) kullanılır ve `X-Frontend-Key` beklenmez. Kimlik doğrulama
 * modeli farklı olan bu uçlar bu yüzden kendi istemcisini kullanır: token'ları çağıran servis açıkça
 * verir, burada hiçbir token otomatik eklenmez ve istek/cevap gövdesi loglanmaz (müşteri verisi).
 */

/** `/config`, `/session`, `/history`, `/event` için (README §4). */
export const ASSISTANT_SHORT_TIMEOUT_MS = 15_000;
/** Yapay zekâ cevapları 25 sn'ye kadar sürebilir; kısa zaman aşımı sağlıklı cevabı keser. */
export const ASSISTANT_TURN_TIMEOUT_MS = 40_000;

const trimSlash = (value: string) => value.replace(/\/+$/, '');

export const assistantHttpClient = axios.create({
  baseURL: appEnv.assistantApiBaseUrl ? trimSlash(appEnv.assistantApiBaseUrl) : undefined,
  timeout: ASSISTANT_SHORT_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

assistantHttpClient.interceptors.request.use((config) => {
  if (!config.baseURL) config.baseURL = trimSlash(getRequiredApiBaseUrl());
  return config;
});
