import { UserProfileResponseDto } from '@/services/user.service';

export interface UserProfile {
  name: string | null;
  surname: string | null;
  phone: string | null;
  email: string | null;
  emailVerified: boolean;
}

/**
 * Maps the `/user/profile` response onto the domain model, resolving
 * `email_verified` from either the response root or the nested `user` object
 * (same precedence as the web client), defaulting to verified when absent.
 */
export function mapUserProfile(response: UserProfileResponseDto): UserProfile {
  const root = response as Record<string, unknown>;
  const nested = (response.user ?? response) as Record<string, unknown>;

  // Same precedence and "absent ⇒ not verified" default as the web client, so
  // the DOĞRULA prompt appears unless the backend explicitly reports verified.
  const rootVerified = typeof root.email_verified === 'boolean' ? root.email_verified : undefined;
  const userVerified = typeof nested.email_verified === 'boolean' ? nested.email_verified : undefined;
  const emailVerified = rootVerified ?? userVerified ?? false;

  return {
    name: (nested.name as string) ?? null,
    surname: (nested.surname as string) ?? null,
    phone: (nested.phone as string) ?? null,
    email: (nested.email as string) ?? null,
    emailVerified,
  };
}
