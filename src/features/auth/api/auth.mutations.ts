import { useMutation } from '@tanstack/react-query';
import {
  loginApi,
  registerApi,
  sendCodeApi,
  verifyCodeApi,
  fastLoginInitApi,
  fastLoginVerifyApi,
  forgotPasswordApi,
  deactivateAccountApi,
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

export function useFastLoginInitMutation() {
  return useMutation({ mutationFn: fastLoginInitApi });
}

export function useFastLoginVerifyMutation() {
  return useMutation({ mutationFn: fastLoginVerifyApi });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: forgotPasswordApi });
}

export function useVerifyCodeMutation() {
  return useMutation({ mutationFn: verifyCodeApi });
}

export function useSendCodeMutation() {
  return useMutation({ mutationFn: sendCodeApi });
}

export function useDeactivateAccountMutation() {
  return useMutation({ mutationFn: deactivateAccountApi });
}
