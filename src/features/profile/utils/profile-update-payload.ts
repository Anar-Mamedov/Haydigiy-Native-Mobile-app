import type { UpdateProfilePayloadDto } from '@/services/user.service';
import { extractTurkishNationalNumber } from '@/utils/turkish-phone';
import type { UserProfile } from '../api/profile.mapper';
import { PROFILE_UPDATE_API_VERSION } from '../constants/phone-change';
import type { UserInfoFormData } from '../schemas/user-info.schema';
import { combineBirthDate } from './birth-date';

export const PHONE_REQUIRED_MESSAGE = 'Telefon numarası zorunludur.';

/**
 * A number already on the account is its SMS login identity, so this screen may
 * replace it (after an SMS code) but never clear it.
 */
export function isProfilePhoneRequired(profile: Pick<UserProfile, 'phone'>): boolean {
  return Boolean(profile.phone?.trim());
}

/**
 * Same comparison the backend makes before asking for a code: digits only, without
 * the country code or a leading zero. Formatting differences are not a change.
 */
export function isSameProfilePhone(saved: string | null | undefined, next: string | null | undefined): boolean {
  return extractTurkishNationalNumber(saved ?? '') === extractTurkishNationalNumber(next ?? '');
}

/**
 * Builds the `PUT /user/profile` body. An unchanged phone goes back exactly as the
 * API returned it, so saving the other fields can never reformat it; a changed one
 * is sent as digits and makes the `v2` backend ask for an SMS code first.
 *
 * The e-mail is optional like on the web: an empty field keeps the saved address
 * (the web sends it back the same way), and an account without one leaves the key
 * out, because the API turns `""` into `null` and its e-mail rule rejects `null`.
 */
export function buildProfileUpdatePayload(
  data: UserInfoFormData,
  profile: Pick<UserProfile, 'phone' | 'email'>,
): UpdateProfilePayloadDto {
  const typedPhone = data.phone.replace(/\D/g, '');
  const savedPhone = profile.phone?.trim() ? profile.phone : null;
  const phone = savedPhone && isSameProfilePhone(savedPhone, typedPhone) ? savedPhone : typedPhone || null;
  const email = data.email.trim() || profile.email?.trim() || '';

  return {
    version: PROFILE_UPDATE_API_VERSION,
    name: data.name.trim(),
    surname: data.surname.trim(),
    ...(email ? { email } : {}),
    phone,
    birth_date: combineBirthDate({ day: data.day, month: data.month, year: data.year }),
    gender: data.gender || null,
  };
}
