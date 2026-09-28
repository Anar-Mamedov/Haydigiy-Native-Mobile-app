import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

export interface UserProfileDto {
  name?: string | null;
  surname?: string | null;
  phone?: string | null;
  email?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  [key: string]: unknown;
}

export interface UserProfileResponseDto {
  user?: UserProfileDto;
  email_verified?: boolean;
  phone_verified?: boolean;
  needs_phone_verification?: boolean;
  phone_verification_status?: string | null;
  [key: string]: unknown;
}

/**
 * Profile contract version sent to `PUT /user/profile`. The endpoint stays
 * backwards compatible: omitting it (or sending `v1`) saves a new phone number
 * straight away, while `v2` first sends an SMS code to that number.
 */
export type ProfileUpdateVersion = 'v1' | 'v2';

export interface UpdateProfilePayloadDto {
  name: string;
  surname: string;
  /**
   * Left out when the account has no e-mail and none was typed: the API turns an
   * empty string into `null`, which its e-mail rule rejects.
   */
  email?: string;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  version?: ProfileUpdateVersion;
  /** Only sent on the second `v2` call, once the user has typed the SMS code. */
  verification_code?: string;
}

export interface UpdateProfileResponseDto {
  success?: boolean;
  message?: string;
  /** `true` while a new phone number still waits for its SMS code; nothing is saved yet. */
  verification_required?: boolean;
  code_sent?: boolean;
  /** Seconds the SMS code stays valid. */
  expires_in?: number;
  /** Seconds before another code may be requested. */
  resend_after?: number;
  remaining_seconds?: number | string;
  remaining_attempts?: number;
  user?: UserProfileDto;
}

/**
 * Fetches the authenticated user's profile (`/user/profile`). This is the source
 * of truth for `email_verified` (the login response does not reliably include
 * it), mirroring the web `useUserProfile`.
 */
export async function getUserProfileDto(): Promise<UserProfileResponseDto | null> {
  if (!appEnv.apiBaseUrl) return null;

  const response = await apiClient.get<UserProfileResponseDto>('/user/profile', {
    headers: { Accept: 'application/json' },
  });
  return response.data ?? null;
}

/**
 * Updates the authenticated user's profile (`PUT /user/profile`). Empty optional
 * fields (phone/birth_date/gender) are sent as `null`, mirroring the web client.
 * Under `v2` a changed phone number only gets an SMS code on the first call; the
 * profile is saved by the follow-up call that carries `verification_code`.
 */
export async function updateProfileDto(
  payload: UpdateProfilePayloadDto,
): Promise<UpdateProfileResponseDto> {
  if (!appEnv.apiBaseUrl) return { success: true };

  const response = await apiClient.put<UpdateProfileResponseDto>('/user/profile', payload, {
    headers: { Accept: 'application/json' },
  });
  return response.data ?? {};
}

/**
 * Changes the authenticated user's password (`PUT /user/change-password`),
 * mirroring the web flow which sends only the new password.
 */
export async function changePasswordDto(newPassword: string): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  await apiClient.put(
    '/user/change-password',
    { new_password: newPassword },
    { headers: { Accept: 'application/json' } },
  );
}
