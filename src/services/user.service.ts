import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

export interface UserProfileDto {
  name?: string | null;
  surname?: string | null;
  phone?: string | null;
  email?: string | null;
  email_verified?: boolean;
  [key: string]: unknown;
}

export interface UserProfileResponseDto {
  user?: UserProfileDto;
  email_verified?: boolean;
  [key: string]: unknown;
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
