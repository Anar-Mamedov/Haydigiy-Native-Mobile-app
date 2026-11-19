import type {
  AnnouncementPreferencesDto,
  UpdateAnnouncementPreferencesPayloadDto,
} from '@/services/announcement-preferences.service';
import { AnnouncementPreferences } from '../types/announcement-preferences.types';

const readFlag = (value: unknown): boolean => value === true || value === 1 || value === '1' || value === 'true';

/**
 * `notify_*` bayraklarını kanal tercihlerine çevirir; eksik bayrak kapalı sayılır (web ile aynı).
 * `notify_whatsapp` hiç gelmiyorsa backend WhatsApp tercihini tanımıyordur: `whatsapp` `null` olur.
 */
export function mapAnnouncementPreferences(dto: AnnouncementPreferencesDto | null | undefined): AnnouncementPreferences {
  return {
    email: readFlag(dto?.notify_email),
    phone: readFlag(dto?.notify_call),
    sms: readFlag(dto?.notify_sms),
    whatsapp: dto?.notify_whatsapp === undefined ? null : readFlag(dto.notify_whatsapp),
  };
}

/**
 * Kaydetme gövdesi: web gibi üç kanal her kayıtta birlikte gider; WhatsApp yalnız backend
 * onu tanıyorsa eklenir (backend alan gelmezse kayıtlı WhatsApp tercihini değiştirmez).
 */
export function toAnnouncementPreferencesPayload(
  preferences: AnnouncementPreferences,
): UpdateAnnouncementPreferencesPayloadDto {
  return {
    notify_email: preferences.email,
    notify_sms: preferences.sms,
    notify_call: preferences.phone,
    ...(preferences.whatsapp === null ? {} : { notify_whatsapp: preferences.whatsapp }),
  };
}
