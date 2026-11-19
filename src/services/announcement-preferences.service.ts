import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

/** Backend bayrakları boolean döndürüyor; eski kayıtlarda 0/1 gelebileceği için gevşek tutulur. */
export interface AnnouncementPreferencesDto {
  notify_email?: boolean | number | string | null;
  notify_sms?: boolean | number | string | null;
  notify_call?: boolean | number | string | null;
  /** HB-3 ile gelir; alanı tanımayan backend sürümleri hiç döndürmez. */
  notify_whatsapp?: boolean | number | string | null;
}

export interface UpdateAnnouncementPreferencesPayloadDto {
  notify_email: boolean;
  notify_sms: boolean;
  notify_call: boolean;
  /** Yalnız backend WhatsApp tercihini döndürüyorsa gönderilir. */
  notify_whatsapp?: boolean;
}

export interface UpdateAnnouncementPreferencesResponseDto {
  message?: string;
  data?: AnnouncementPreferencesDto | null;
}

/**
 * Duyuru (e-posta / SMS / arama / WhatsApp) tercihleri.
 *
 * Backend `UserPreferenceController`'ı `auth` grubunda yayınlıyor (`GET|PUT /auth/preferences`).
 * Web eskiden var olmayan `/user/preferences` adresini çağırıyordu (canlıda 404); HF-63'ten
 * beri o da bu adresi kullanıyor.
 */
const PREFERENCES_PATH = '/auth/preferences';

/** Kullanıcının kayıtlı tercihleri (`GET /auth/preferences`). */
export async function getAnnouncementPreferencesDto(): Promise<AnnouncementPreferencesDto | null> {
  if (!appEnv.apiBaseUrl) return null;

  const response = await apiClient.get<AnnouncementPreferencesDto>(PREFERENCES_PATH);
  return response.data ?? null;
}

/** Tercihleri birlikte kaydeder (`PUT /auth/preferences`), web ile aynı gövdeyle. */
export async function updateAnnouncementPreferencesDto(
  payload: UpdateAnnouncementPreferencesPayloadDto,
): Promise<UpdateAnnouncementPreferencesResponseDto> {
  if (!appEnv.apiBaseUrl) return {};

  const response = await apiClient.put<UpdateAnnouncementPreferencesResponseDto>(PREFERENCES_PATH, payload);
  return response.data ?? {};
}
