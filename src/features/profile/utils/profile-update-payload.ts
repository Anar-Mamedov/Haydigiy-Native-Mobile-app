import type { UpdateProfilePayloadDto } from '@/services/user.service';
import type { UserProfile } from '../api/profile.mapper';
import type { UserInfoFormData } from '../schemas/user-info.schema';
import { combineBirthDate } from './birth-date';

/**
 * A number already on the account is its SMS login identity, and
 * `PUT /user/profile` saves a new one without asking for a code. So once an
 * account has a number, "Kullanıcı Bilgilerim" only shows it. An account without
 * one may still add it there; the phone verification gate then confirms it.
 */
export function isProfilePhoneLocked(profile: Pick<UserProfile, 'phone'>): boolean {
  return Boolean(profile.phone?.trim());
}

/**
 * Builds the `PUT /user/profile` body. A locked phone goes back exactly as the
 * API returned it, so saving can never change or even reformat it. It is sent
 * rather than omitted because the endpoint requires a phone on an account that
 * has no e-mail on file yet.
 */
export function buildProfileUpdatePayload(
  data: UserInfoFormData,
  profile: Pick<UserProfile, 'phone'>,
): UpdateProfilePayloadDto {
  return {
    name: data.name.trim(),
    surname: data.surname.trim(),
    email: data.email.trim(),
    phone: isProfilePhoneLocked(profile) ? profile.phone : data.phone.replace(/\D/g, '') || null,
    birth_date: combineBirthDate({ day: data.day, month: data.month, year: data.year }),
    gender: data.gender || null,
  };
}
