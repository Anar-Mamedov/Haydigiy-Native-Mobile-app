import { useCallback, useRef, useState } from 'react';
import { useOtpCooldown } from '@/features/auth/hooks/use-otp-cooldown';
import { getOtpRateLimit, getOtpSendErrorFeedback } from '@/features/auth/utils/otp-delivery';
import { getApiErrorMessage } from '@/utils/api-error';
import {
  useSendEmailVerificationCodeMutation,
  useVerifyEmailCodeMutation,
} from '../api/email-verification.mutations';
import {
  EMAIL_VERIFICATION_CODE_LENGTH,
  EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
} from '../constants/email-verification';

const CODE_SENT_INFO = 'Doğrulama kodu e-posta adresinize gönderildi.';
const RECENT_CODE_INFO =
  'Kısa süre önce bir kod gönderildi. Gelen kodu girebilir ya da süre bitince yenisini isteyebilirsiniz.';
const RESEND_INFO = 'Yeni doğrulama kodu gönderildi.';
const VERIFY_ERROR = 'Girdiğiniz kod hatalı veya süresi dolmuş.';
const CODE_LENGTH_ERROR = `Lütfen ${EMAIL_VERIFICATION_CODE_LENGTH} haneli doğrulama kodunu girin.`;

type UseEmailVerificationOptions = {
  /** The saved address; codes are only ever sent to the e-mail the backend has. */
  email: string;
  /** Called once the backend accepted the code. */
  onVerified: () => void;
};

/**
 * Owns the e-mail verification flow of the profile screen, mirroring the web:
 * "Doğrula" sends a code to the saved address and opens the code sheet; the code is
 * confirmed with `POST /auth/verify-code`. Requests, cooldown and messages live here
 * so the sheet stays presentational.
 */
export function useEmailVerification({ email, onVerified }: UseEmailVerificationOptions) {
  const { isPending: isSending, mutateAsync: sendCode } = useSendEmailVerificationCodeMutation();
  const { isPending: isVerifying, mutateAsync: verifyCode } = useVerifyEmailCodeMutation();
  const { secondsLeft: cooldownSeconds, start: startCooldown } = useOtpCooldown();

  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  /** Shown beside the "Doğrula" button when the first code could not be sent. */
  const [startError, setStartError] = useState<string | null>(null);
  /** A double tap must not send two codes (the second would only hit the cooldown). */
  const sendingRef = useRef(false);

  const open = useCallback(
    (cooldown: number, info: string) => {
      setCode('');
      setErrorMessage(null);
      setInfoMessage(info);
      startCooldown(cooldown);
      setIsOpen(true);
    },
    [startCooldown],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setCode('');
    setErrorMessage(null);
    setInfoMessage(null);
  }, []);

  /** "Doğrula" — sends the first code and opens the sheet. */
  const start = useCallback(async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setStartError(null);

    try {
      const result = await sendCode(email);
      open(EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS, result?.message || CODE_SENT_INFO);
    } catch (error) {
      // Asked again inside the resend window: the earlier code is still valid, so the
      // sheet opens with the backend's countdown instead of an error.
      const rateLimit = getOtpRateLimit(error);
      if (rateLimit) {
        open(rateLimit.cooldownSeconds, RECENT_CODE_INFO);
        return;
      }

      setStartError(getOtpSendErrorFeedback(error).message);
    } finally {
      sendingRef.current = false;
    }
  }, [email, open, sendCode]);

  /** The user typed the code. */
  const submitCode = useCallback(async () => {
    if (code.length !== EMAIL_VERIFICATION_CODE_LENGTH) {
      setErrorMessage(CODE_LENGTH_ERROR);
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);

    try {
      await verifyCode({ email, code });
      close();
      onVerified();
    } catch (error) {
      // Too many wrong codes: new codes are refused until the backend's window ends.
      const rateLimit = getOtpRateLimit(error);
      if (rateLimit) startCooldown(rateLimit.cooldownSeconds);

      setErrorMessage(rateLimit?.message ?? getApiErrorMessage(error, VERIFY_ERROR));
      setCode('');
    }
  }, [close, code, email, onVerified, startCooldown, verifyCode]);

  /** The code never arrived or expired. */
  const resendCode = useCallback(async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const result = await sendCode(email);
      startCooldown(EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS);
      setInfoMessage(result?.message || RESEND_INFO);
      setCode('');
    } catch (error) {
      const feedback = getOtpSendErrorFeedback(error);
      startCooldown(feedback.cooldownSeconds);
      setErrorMessage(feedback.message);
    } finally {
      sendingRef.current = false;
    }
  }, [email, sendCode, startCooldown]);

  return {
    cancel: close,
    code,
    /** Seconds before "Kodu Tekrar Gönder" becomes available again. */
    cooldownSeconds,
    errorMessage,
    infoMessage,
    isOpen,
    isResending: isSending && isOpen,
    /** The first code is on its way; the "Doğrula" button shows progress. */
    isStarting: isSending && !isOpen,
    isVerifying,
    resendCode,
    setCode,
    start,
    startError,
    submitCode,
  };
}
