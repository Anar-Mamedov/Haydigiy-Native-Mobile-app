import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileKeys } from './profile.keys';
import {
  changePasswordDto,
  updateProfileDto,
  UpdateProfilePayloadDto,
} from '@/services/user.service';
import { useAuthStore } from '@/features/auth/store/use-auth-store';

/**
 * Updates the user profile (`PUT /user/profile`), refreshes the cached profile and
 * keeps the auth-store identity (header name / e-mail) in sync with the new values.
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayloadDto) => updateProfileDto(payload),
    onSuccess: (_result, payload) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });

      const { user, setUser } = useAuthStore.getState();
      if (user) {
        setUser({
          ...user,
          name: payload.name,
          surname: payload.surname,
          email: payload.email,
          phoneNumber: payload.phone ?? undefined,
        });
      }
    },
  });
}

/** Changes the user's password (`PUT /user/change-password`). */
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (newPassword: string) => changePasswordDto(newPassword),
  });
}
