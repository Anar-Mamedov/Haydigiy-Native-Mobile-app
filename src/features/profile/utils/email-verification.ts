import type { UserProfile } from '../api/profile.mapper';

/**
 * The saved address when it still needs verifying, otherwise `null`. Decides whether the
 * profile screen shows the "E-Posta Adresinizi Doğrulamanız Gerekmektedir" card, like the
 * web: there must be an e-mail and the backend must report it as not verified.
 */
export function getUnverifiedEmail(
  profile: Pick<UserProfile, 'email' | 'emailVerified'> | null | undefined,
): string | null {
  const email = profile?.email?.trim();
  if (!email || profile?.emailVerified !== false) return null;

  return email;
}
