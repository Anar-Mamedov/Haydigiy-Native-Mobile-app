import { useQuery } from '@tanstack/react-query';
import { profileKeys } from './profile.keys';
import { mapUserProfile, UserProfile } from './profile.mapper';
import { getUserProfileDto } from '@/services/user.service';
import { useAuthStore } from '@/features/auth/store/use-auth-store';

/**
 * Loads the authenticated user's profile (`/user/profile`) into a session-scoped
 * cache so verification state cannot leak between consecutive users.
 */
export function useUserProfileQuery(enabled = true) {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const sessionKey = userId === null ? 'signed-out' : String(userId);

  return useQuery<UserProfile | null>({
    queryKey: profileKeys.session(sessionKey),
    enabled: enabled && Boolean(userId),
    queryFn: async () => {
      const dto = await getUserProfileDto();
      return dto ? mapUserProfile(dto) : null;
    },
    staleTime: 60_000,
  });
}
