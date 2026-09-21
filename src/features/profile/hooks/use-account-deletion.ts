import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useDeactivateAccountMutation } from '@/features/auth/api/auth.mutations';
import { useOtpCooldown } from '@/features/auth/hooks/use-otp-cooldown';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { getOtpSendErrorFeedback, parseOtpCooldownSeconds } from '@/features/auth/utils/otp-delivery';
import {
  ACCOUNT_DELETION_API_VERSION,
  ACCOUNT_DELETION_CODE_LENGTH,
  ACCOUNT_DELETION_RESEND_COOLDOWN_SECONDS,
} from '@/features/profile/constants/account-deletion';
import {
  isAccountDeletionCodeSent,
  isAccountDeletionCompleted,
} from '@/features/profile/utils/account-deletion-result';
import { getApiErrorMessage } from '@/utils/api-error';

const START_ERROR = 'Hesap silinirken bir hata oluştu. Lütfen tekrar deneyiniz.';
const VERIFY_ERROR = 'Girdiğiniz kod hatalı veya süresi dolmuş.';
const CODE_LENGTH_ERROR = `Lütfen ${ACCOUNT_DELETION_CODE_LENGTH} haneli doğrulama kodunu girin.`;

/**
 * Owns the whole "Hesabımı Sil" lifecycle: the destructive confirmation, the
 * `v2` verification-code round trip and the sign-out that follows a closed
 * account. Screens stay presentational and only bind to the returned state.
 *
 * Under `v1` (or an older backend that ignores the version) the first request
 * already closes the account, so the hook signs the user out without ever
 * opening the code screen.
 */
export function useAccountDeletion() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  // Two mutation instances so "kodu gönder" and "kodu doğrula" report their
  // pending state independently while sharing one endpoint. Only `mutateAsync`
  // is destructured: it is stable, so the callbacks below stay memoized.
  const { isPending: isRequestPending, mutateAsync: requestDeletion } = useDeactivateAccountMutation();
  const { isPending: isConfirmPending, mutateAsync: confirmDeletion } = useDeactivateAccountMutation();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const { secondsLeft: cooldownSeconds, start: startCooldown } = useOtpCooldown();

  const resetVerificationState = useCallback(() => {
    setCode('');
    setErrorMessage(null);
    setInfoMessage(null);
  }, []);

  const completeDeletion = useCallback(async () => {
    await logout();
    setIsConfirmOpen(false);
    setIsVerificationOpen(false);
    resetVerificationState();
    router.replace('/');
  }, [logout, resetVerificationState, router]);

  /** Step 1 — the user confirmed the destructive dialog. */
  const startDeletion = useCallback(async () => {
    setStartError(null);

    try {
      const result = await requestDeletion({
        version: ACCOUNT_DELETION_API_VERSION,
      });

      if (isAccountDeletionCodeSent(result)) {
        resetVerificationState();
        startCooldown(
          parseOtpCooldownSeconds(result.remaining_seconds, ACCOUNT_DELETION_RESEND_COOLDOWN_SECONDS),
        );
        setInfoMessage(result.message ?? null);
        setIsConfirmOpen(false);
        setIsVerificationOpen(true);
        return;
      }

      if (isAccountDeletionCompleted(result)) {
        await completeDeletion();
        return;
      }

      setIsConfirmOpen(false);
      setStartError(result.message ?? START_ERROR);
    } catch (error) {
      setIsConfirmOpen(false);
      setStartError(getApiErrorMessage(error, START_ERROR));
    }
  }, [completeDeletion, requestDeletion, resetVerificationState, startCooldown]);

  /** Step 2 — the user typed the SMS code. */
  const submitCode = useCallback(async () => {
    if (code.length !== ACCOUNT_DELETION_CODE_LENGTH) {
      setErrorMessage(CODE_LENGTH_ERROR);
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const result = await confirmDeletion({
        verification_code: code,
        version: ACCOUNT_DELETION_API_VERSION,
      });

      if (isAccountDeletionCompleted(result)) {
        await completeDeletion();
        return;
      }

      // Still unverified: the backend rejected the code without failing the call.
      setErrorMessage(result.message ?? VERIFY_ERROR);
      setCode('');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, VERIFY_ERROR));
      setCode('');
    }
  }, [code, completeDeletion, confirmDeletion]);

  /** Step 2b — the code never arrived, ask for a new one. */
  const resendCode = useCallback(async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const result = await requestDeletion({
        version: ACCOUNT_DELETION_API_VERSION,
      });

      startCooldown(
        parseOtpCooldownSeconds(result.remaining_seconds, ACCOUNT_DELETION_RESEND_COOLDOWN_SECONDS),
      );
      setInfoMessage(result.message ?? 'Yeni doğrulama kodu gönderildi.');
      setCode('');
    } catch (error) {
      const feedback = getOtpSendErrorFeedback(error);
      startCooldown(feedback.cooldownSeconds);
      setErrorMessage(feedback.message);
    }
  }, [requestDeletion, startCooldown]);

  const openConfirm = useCallback(() => {
    setStartError(null);
    setIsConfirmOpen(true);
  }, []);

  const dismissStartError = useCallback(() => setStartError(null), []);

  const cancelVerification = useCallback(() => {
    setIsVerificationOpen(false);
    resetVerificationState();
  }, [resetVerificationState]);

  return {
    cancelVerification,
    code,
    /** Seconds before "Kodu Tekrar Gönder" becomes available again. */
    cooldownSeconds,
    dismissStartError,
    errorMessage,
    infoMessage,
    isConfirmOpen,
    isResending: isRequestPending && isVerificationOpen,
    isStarting: isRequestPending && !isVerificationOpen,
    isVerificationOpen,
    isVerifying: isConfirmPending,
    openConfirm,
    resendCode,
    setCode,
    setIsConfirmOpen,
    startDeletion,
    startError,
    submitCode,
  };
}
