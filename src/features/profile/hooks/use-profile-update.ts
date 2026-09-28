import { useCallback, useRef, useState } from 'react';
import { useOtpCooldown } from '@/features/auth/hooks/use-otp-cooldown';
import { getOtpSendErrorFeedback, parseOtpCooldownSeconds } from '@/features/auth/utils/otp-delivery';
import type { UpdateProfilePayloadDto, UpdateProfileResponseDto } from '@/services/user.service';
import { getApiErrorMessage } from '@/utils/api-error';
import { useUpdateProfileMutation } from '../api/profile.mutations';
import {
  PHONE_CHANGE_CODE_LENGTH,
  PHONE_CHANGE_RESEND_COOLDOWN_SECONDS,
} from '../constants/phone-change';
import {
  getRemainingCodeAttempts,
  isPhoneChangeCodeSent,
  isPhoneChangeStillPending,
  isProfileUpdateSaved,
} from '../utils/profile-update-result';

const VERIFY_ERROR = 'Girdiğiniz kod hatalı veya süresi dolmuş.';
const RESEND_ERROR = 'Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.';
const RESEND_INFO = 'Yeni doğrulama kodu gönderildi.';
const CODE_LENGTH_ERROR = `Lütfen ${PHONE_CHANGE_CODE_LENGTH} haneli doğrulama kodunu girin.`;

export type ProfileSaveOutcome = 'saved' | 'verification-required';

type UseProfileUpdateOptions = {
  /** Called once the SMS code is accepted and the whole form has been saved. */
  onPhoneVerified: () => void;
};

function getResendCooldown(result: UpdateProfileResponseDto): number {
  return parseOtpCooldownSeconds(
    result.resend_after ?? result.remaining_seconds,
    PHONE_CHANGE_RESEND_COOLDOWN_SECONDS,
  );
}

function withRemainingAttempts(message: string, remainingAttempts: number | null): string {
  if (remainingAttempts === null || remainingAttempts <= 0) return message;
  return `${message} Kalan deneme hakkınız: ${remainingAttempts}.`;
}

/**
 * Owns the profile save lifecycle, including the `v2` phone change: when the
 * number changed, the first save only sends an SMS code and the call that carries
 * the code saves the whole form.
 *
 * The body of that first call is frozen and reused verbatim for every follow-up
 * (verify and resend). The backend rejects a code sent for another number, and
 * edits made while the code screen is open — or a field tampered with in between —
 * must never reach the verification request.
 */
export function useProfileUpdate({ onPhoneVerified }: UseProfileUpdateOptions) {
  // Two mutation instances so "kaydet / kod gönder" and "kodu doğrula" report their
  // pending state independently while sharing one endpoint.
  const { isPending: isSavePending, mutateAsync: requestSave } = useUpdateProfileMutation();
  const { isPending: isConfirmPending, mutateAsync: confirmSave } = useUpdateProfileMutation();

  const pendingPayloadRef = useRef<Readonly<UpdateProfilePayloadDto> | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const { secondsLeft: cooldownSeconds, start: startCooldown } = useOtpCooldown();

  const openVerification = useCallback(
    (payload: UpdateProfilePayloadDto, cooldown: number, info: string | null) => {
      pendingPayloadRef.current = Object.freeze({ ...payload });
      setPendingPhone(payload.phone);
      setCode('');
      setErrorMessage(null);
      setInfoMessage(info);
      startCooldown(cooldown);
      setIsVerificationOpen(true);
    },
    [startCooldown],
  );

  const closeVerification = useCallback(() => {
    pendingPayloadRef.current = null;
    setPendingPhone(null);
    setIsVerificationOpen(false);
    setCode('');
    setErrorMessage(null);
    setInfoMessage(null);
  }, []);

  /**
   * Step 1 — the form was submitted. Resolves with what happened; rejects with the
   * API error so the form can attach it to its fields.
   */
  const save = useCallback(
    async (payload: UpdateProfilePayloadDto): Promise<ProfileSaveOutcome> => {
      if (pendingPayloadRef.current) return 'verification-required';

      try {
        const result = await requestSave(payload);

        if (isPhoneChangeCodeSent(result)) {
          openVerification(payload, getResendCooldown(result), result.message ?? null);
          return 'verification-required';
        }

        if (!isProfileUpdateSaved(result)) {
          // Same shape as an axios rejection, so the form reads the message the same way.
          throw Object.assign(new Error(result.message ?? 'Profile update failed'), {
            response: { data: result },
          });
        }

        return 'saved';
      } catch (error) {
        // Sent again inside the resend window: a code is already on its way, so the
        // code screen reopens with the backend's countdown instead of an error.
        if (isPhoneChangeStillPending(error)) {
          openVerification(
            payload,
            getOtpSendErrorFeedback(error).cooldownSeconds,
            getApiErrorMessage(error, RESEND_ERROR),
          );
          return 'verification-required';
        }

        throw error;
      }
    },
    [openVerification, requestSave],
  );

  /** Step 2 — the user typed the SMS code. */
  const submitCode = useCallback(async () => {
    const pendingPayload = pendingPayloadRef.current;
    if (!pendingPayload) return;

    if (code.length !== PHONE_CHANGE_CODE_LENGTH) {
      setErrorMessage(CODE_LENGTH_ERROR);
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const result = await confirmSave({ ...pendingPayload, verification_code: code });

      if (isProfileUpdateSaved(result)) {
        closeVerification();
        onPhoneVerified();
        return;
      }

      setErrorMessage(result.message ?? VERIFY_ERROR);
      setCode('');
    } catch (error) {
      const remainingAttempts = getRemainingCodeAttempts(error);
      // Out of attempts: the backend dropped the code, so a new one may be asked for at once.
      if (remainingAttempts === 0) startCooldown(0);

      setErrorMessage(withRemainingAttempts(getApiErrorMessage(error, VERIFY_ERROR), remainingAttempts));
      setCode('');
    }
  }, [closeVerification, code, confirmSave, onPhoneVerified, startCooldown]);

  /** Step 2b — the code never arrived or expired: ask again for the same frozen payload. */
  const resendCode = useCallback(async () => {
    const pendingPayload = pendingPayloadRef.current;
    if (!pendingPayload) return;

    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const result = await requestSave(pendingPayload);

      if (!isPhoneChangeCodeSent(result) && isProfileUpdateSaved(result)) {
        closeVerification();
        onPhoneVerified();
        return;
      }

      startCooldown(getResendCooldown(result));
      setInfoMessage(result.message ?? RESEND_INFO);
      setCode('');
    } catch (error) {
      startCooldown(getOtpSendErrorFeedback(error).cooldownSeconds);
      setErrorMessage(getApiErrorMessage(error, RESEND_ERROR));
    }
  }, [closeVerification, onPhoneVerified, requestSave, startCooldown]);

  return {
    cancelVerification: closeVerification,
    code,
    /** Seconds before "Kodu Tekrar Gönder" becomes available again. */
    cooldownSeconds,
    errorMessage,
    infoMessage,
    isResending: isSavePending && isVerificationOpen,
    isSaving: isSavePending && !isVerificationOpen,
    isVerificationOpen,
    isVerifying: isConfirmPending,
    /** The number the pending code was sent to. */
    pendingPhone,
    resendCode,
    save,
    setCode,
    submitCode,
  };
}
