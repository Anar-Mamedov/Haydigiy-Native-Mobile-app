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
  [key: string]: unknown;
}

export interface UserProfileResponseDto {
  user?: UserProfileDto;
  email_verified?: boolean;
  [key: string]: unknown;
}

export interface UpdateProfilePayloadDto {
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
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
 */
export async function updateProfileDto(payload: UpdateProfilePayloadDto): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  await apiClient.put('/user/profile', payload, {
    headers: { Accept: 'application/json' },
  });
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
