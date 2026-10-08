import type {
  AnnouncementPreferencesDto,
  UpdateAnnouncementPreferencesPayloadDto,
} from '@/services/announcement-preferences.service';
import { AnnouncementPreferences } from '../types/announcement-preferences.types';

const readFlag = (value: unknown): boolean => value === true || value === 1 || value === '1' || value === 'true';

/** `notify_*` bayraklarını kanal tercihlerine çevirir; eksik bayrak kapalı sayılır (web ile aynı). */
export function mapAnnouncementPreferences(dto: AnnouncementPreferencesDto | null | undefined): AnnouncementPreferences {
  return {
    email: readFlag(dto?.notify_email),
    phone: readFlag(dto?.notify_call),
    sms: readFlag(dto?.notify_sms),
  };
}

/** Kaydetme gövdesi: web her kaydette üç bayrağı birlikte gönderiyor. */
export function toAnnouncementPreferencesPayload(
  preferences: AnnouncementPreferences,
): UpdateAnnouncementPreferencesPayloadDto {
  return {
    notify_email: preferences.email,
    notify_sms: preferences.sms,
    notify_call: preferences.phone,
  };
}
