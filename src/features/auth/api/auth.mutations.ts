import { useMutation } from '@tanstack/react-query';
import {
  loginApi,
  registerApi,
  sendCodeApi,
  verifyCodeApi,
  fastLoginInitApi,
  fastLoginVerifyApi,
  forgotPasswordApi,
  resetPasswordApi,
  deactivateAccountApi,
} from '@/services/auth.service';
import type {
  DeactivateAccountPayload,
  DeactivateAccountResponse,
} from '@/services/auth.service';

/**
 * Auth flows are remote async mutations, so they go through TanStack Query
 * instead of calling the service directly inside component bodies. Each hook
 * wraps a single auth endpoint from the shared Axios-backed service.
 */

export function useLoginMutation() {
  return useMutation({ mutationFn: loginApi });
}

export function useRegisterMutation() {
  return useMutation({ mutationFn: registerApi });
}

// OTP send/verify calls never retry on their own: a repeated wrong code burns a second
// attempt toward the backend's lock, and a refused (429) send is refused again.
export function useFastLoginInitMutation() {
  return useMutation({ mutationFn: fastLoginInitApi, retry: false });
}

export function useFastLoginVerifyMutation() {
  return useMutation({ mutationFn: fastLoginVerifyApi, retry: false });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: forgotPasswordApi, retry: false });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: resetPasswordApi });
}

export function useVerifyCodeMutation() {
  return useMutation({ mutationFn: verifyCodeApi, retry: false });
}

export function useSendCodeMutation() {
  return useMutation({ mutationFn: sendCodeApi, retry: false });
}

/**
 * `POST /auth/deactivate`. The payload carries the contract version: `v2` asks
 * for an SMS code first, a second call with `verification_code` closes the
 * account. Retries stay off so a destructive call is never repeated on its own.
 */
export function useDeactivateAccountMutation() {
  return useMutation<DeactivateAccountResponse, unknown, DeactivateAccountPayload>({
    mutationFn: deactivateAccountApi,
    retry: false,
  });
}
