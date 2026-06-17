import { useQuery } from '@tanstack/react-query';
import { profileKeys } from './profile.keys';
import { mapUserProfile, UserProfile } from './profile.mapper';
import { getUserProfileDto } from '@/services/user.service';

/**
 * Loads the authenticated user's profile (`/user/profile`) so screens can read a
 * reliable `emailVerified` flag. Pass `enabled=false` to skip when signed out.
 */
export function useUserProfileQuery(enabled = true) {
  return useQuery<UserProfile | null>({
    queryKey: profileKeys.me(),
    enabled,
    queryFn: async () => {
      const dto = await getUserProfileDto();
      return dto ? mapUserProfile(dto) : null;
    },
    staleTime: 60_000,
  });
}
