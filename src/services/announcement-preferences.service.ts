import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

/** Backend bayrakları boolean döndürüyor; eski kayıtlarda 0/1 gelebileceği için gevşek tutulur. */
export interface AnnouncementPreferencesDto {
  notify_email?: boolean | number | string | null;
  notify_sms?: boolean | number | string | null;
  notify_call?: boolean | number | string | null;
}

export interface UpdateAnnouncementPreferencesPayloadDto {
  notify_email: boolean;
  notify_sms: boolean;
  notify_call: boolean;
}

export interface UpdateAnnouncementPreferencesResponseDto {
  message?: string;
  data?: AnnouncementPreferencesDto | null;
}

/**
 * Duyuru (e-posta / SMS / arama) tercihleri.
 *
 * Web `/user/preferences` adresini çağırıyor, ancak backend `UserPreferenceController`'ı
 * `auth` grubunda yayınlıyor (`GET|PUT /auth/preferences`); `/user/preferences` canlıda
 * 404 dönüyor. Controller, istek ve yanıt gövdesi aynı olduğu için uygulama çalışan
 * adresi kullanır.
 */
const PREFERENCES_PATH = '/auth/preferences';

/** Kullanıcının kayıtlı tercihleri (`GET /auth/preferences`). */
export async function getAnnouncementPreferencesDto(): Promise<AnnouncementPreferencesDto | null> {
  if (!appEnv.apiBaseUrl) return null;

  const response = await apiClient.get<AnnouncementPreferencesDto>(PREFERENCES_PATH);
  return response.data ?? null;
}

/** Üç tercihi birlikte kaydeder (`PUT /auth/preferences`), web ile aynı gövdeyle. */
export async function updateAnnouncementPreferencesDto(
  payload: UpdateAnnouncementPreferencesPayloadDto,
): Promise<UpdateAnnouncementPreferencesResponseDto> {
  if (!appEnv.apiBaseUrl) return {};

  const response = await apiClient.put<UpdateAnnouncementPreferencesResponseDto>(PREFERENCES_PATH, payload);
  return response.data ?? {};
}
