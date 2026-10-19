import { isAxiosError, type AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { getInstalledAppVersion } from '@/features/app-update/utils/installed-app-version';
import { assistantHttpClient, ASSISTANT_TURN_TIMEOUT_MS } from '@/lib/assistant-http';
import type { AssistantEvent, AssistantTurnInput } from '@/types/assistant.types';

/**
 * Haydi Asistan uçları (connect `/api/assistant/*`, teslim paketi 1.1 README §4).
 * Cevaplar ham gövde olarak döner; alan eşlemesi `features/assistant/api/*.mapper.ts`'tedir.
 */

/**
 * Sözleşmedeki platform değerleri yalnız `web | mobile_web | webview`; native uygulama için ayrı bir
 * değer YOK (backend uygulamayı WebView sarmalayıcısı sanıyor). En yakın değer `webview`; backend
 * `app` gibi bir değer eklediğinde yalnız bu sabit değişir.
 */
export const ASSISTANT_PLATFORM: string = 'webview';

export type AssistantErrorKind = 'http' | 'network' | 'timeout' | 'malformed';

export class AssistantApiError extends Error {
  constructor(
    readonly kind: AssistantErrorKind,
    readonly status: number,
    readonly body: Record<string, unknown> | null,
  ) {
    super(typeof body?.code === 'string' ? body.code : kind);
    this.name = 'AssistantApiError';
  }

  get code(): string {
    return typeof this.body?.code === 'string' ? this.body.code : '';
  }

  get serverMessage(): string {
    return typeof this.body?.message === 'string' ? this.body.message : '';
  }

  get retryAfter(): number {
    const value = Number(this.body?.retry_after);
    return Number.isFinite(value) && value > 0 ? Math.ceil(value) : 0;
  }
}

type RawBody = Record<string, unknown>;

const isRecord = (value: unknown): value is RawBody =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const clientHeader = (): string => {
  const { applicationVersion } = getInstalledAppVersion();
  return `ha-app/${applicationVersion ?? '0'} (${Platform.OS})`;
};

const toApiError = (error: unknown): AssistantApiError => {
  if (error instanceof AssistantApiError) return error;
  if (!isAxiosError(error)) return new AssistantApiError('malformed', 0, null);
  if (error.response) {
    const data: unknown = error.response.data;
    return new AssistantApiError(
      isRecord(data) ? 'http' : 'malformed',
      error.response.status,
      isRecord(data) ? data : null,
    );
  }
  const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
  return new AssistantApiError(timedOut ? 'timeout' : 'network', 0, null);
};

interface AssistantRequest {
  method: 'GET' | 'POST';
  url: string;
  token?: string | null;
  siteToken?: string | null;
  body?: unknown;
  timeout?: number;
}

const request = async ({
  method,
  url,
  token,
  siteToken,
  body,
  timeout,
}: AssistantRequest): Promise<RawBody | null> => {
  const headers: Record<string, string> = {
    'X-Assistant-Platform': ASSISTANT_PLATFORM,
    'X-Assistant-Client': clientHeader(),
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['X-Assistant-Token'] = token;
  if (siteToken) headers.Authorization = `Bearer ${siteToken}`;
  const config: AxiosRequestConfig = { method, url, headers, data: body, timeout };
  try {
    const response = await assistantHttpClient.request<unknown>(config);
    if (response.status === 204) return null;
    if (!isRecord(response.data)) throw new AssistantApiError('malformed', response.status, null);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const getAssistantConfigDto = () => request({ method: 'GET', url: '/assistant/config' });

/** Site token'ı YALNIZ burada, `Authorization` başlığında gider (README §2 kural 7). */
export const createAssistantSessionDto = (siteToken: string | null, platform: string = ASSISTANT_PLATFORM) =>
  request({ method: 'POST', url: '/assistant/session', siteToken, body: { platform } });

export const sendAssistantTurnDto = (token: string, clientMsgId: string, input: AssistantTurnInput) =>
  request({
    method: 'POST',
    url: '/assistant/turn',
    token,
    body: { client_msg_id: clientMsgId, input },
    timeout: ASSISTANT_TURN_TIMEOUT_MS,
  });

export const getAssistantHistoryDto = (token: string) =>
  request({ method: 'GET', url: '/assistant/history?limit=30', token });

/** Ölçüm: cevap beklenmez, hata yutulur; akışı ASLA bekletmez (README §4.6). */
export const postAssistantEvents = (token: string, events: AssistantEvent[]): void => {
  request({ method: 'POST', url: '/assistant/event', token, body: { events } }).catch(() => undefined);
};

/** En iyi çaba: başarısız olsa da yerel oturum silinir (README §4.7). */
export const logoutAssistantSession = (token: string): void => {
  request({ method: 'POST', url: '/assistant/auth/logout', token, body: {} }).catch(() => undefined);
};
