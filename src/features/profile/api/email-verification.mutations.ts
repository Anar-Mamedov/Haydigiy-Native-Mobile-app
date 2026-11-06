import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendCodeApi, verifyEmailCodeApi } from '@/services/auth.service';
import { profileKeys } from './profile.keys';

export type VerifyEmailCodeVariables = {
  email: string;
  code: string;
};

/**
 * Sends a verification code to the signed-in user's saved e-mail address. Never
 * retried on its own: a refused (429) send is refused again.
 */
export function useSendEmailVerificationCodeMutation() {
  return useMutation({
    mutationFn: (email: string) => sendCodeApi({ type: 'email', value: email }),
    retry: false,
  });
}

/**
 * Confirms the e-mail code. On success the profile is refetched: it is the source of
 * the "doğrulanmamış" note, the account header badge and the completion bar. The
 * auth-store user is left alone, since `setUser` also re-sends tracking attributes.
 * Never retried: a repeated wrong code burns another attempt toward the backend's lock.
 */
export function useVerifyEmailCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: VerifyEmailCodeVariables) => verifyEmailCodeApi(variables),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.me() }),
  });
}
