import { useCallback, useEffect, useRef, useState } from 'react';
import type { FeedbackSubmitPayload, FeedbackSubmitResult } from '@/types/customer-feedback.types';
import { uuidv4 } from '@/utils/uuid';
import { useSubmitCustomerFeedbackMutation } from '../api/customer-feedback.mutations';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';
import { toFeedbackApiError, type FeedbackApiError } from '../utils/feedback-api-error';

export type SubmitOutcome =
  | { type: 'success'; result: FeedbackSubmitResult }
  | { type: 'field_errors'; errors: Record<string, string> }
  | { type: 'attachment_errors'; errors: Record<string, string> }
  | { type: 'form_outdated' }
  | { type: 'failed' };

const IN_PROGRESS_RETRY_MS = 2500;
const MAX_IN_PROGRESS_RETRIES = 3;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function generalMessage(error: FeedbackApiError): string {
  if (error.kind === 'disabled') return T.disabled;
  if (error.kind === 'too_many') return T.tooMany;
  if (error.kind === 'unavailable' || error.kind === 'network' || error.kind === 'in_progress') return T.unavailable;
  return T.genericError;
}

/**
 * Gönderim yaşam döngüsü (sözleşme v1.0 §5.3.5). Bir gönderim denemesinin bütün tekrarları AYNI
 * `Idempotency-Key` ile gider; içerik değişirse ya da başarıdan sonra yeni anahtar üretilir.
 * 409'da 2,5 sn sonra aynı anahtarla yeniden denenir; 429'da düğme `Retry-After` boyunca kilitlenir.
 * Hiçbir hata "alındı" sayılmaz ve form içeriği silinmez.
 */
export function useFeedbackSubmit() {
  const mutation = useSubmitCustomerFeedbackMutation();
  const attemptRef = useRef<{ key: string; signature: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FeedbackSubmitResult | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [blockedSeconds, setBlockedSeconds] = useState(0);

  useEffect(() => {
    if (blockedSeconds <= 0) return;
    const timer = setTimeout(() => setBlockedSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearTimeout(timer);
  }, [blockedSeconds]);

  const keyFor = (payload: FeedbackSubmitPayload): string => {
    const signature = JSON.stringify(payload);
    if (attemptRef.current?.signature !== signature) attemptRef.current = { key: uuidv4(), signature };
    return attemptRef.current.key;
  };

  const send = useCallback(
    async (payload: FeedbackSubmitPayload, idempotencyKey: string): Promise<FeedbackSubmitResult> => {
      for (let attempt = 0; ; attempt += 1) {
        try {
          return await mutation.mutateAsync({ payload, idempotencyKey });
        } catch (cause) {
          const error = toFeedbackApiError(cause);
          if (error.kind !== 'in_progress' || attempt >= MAX_IN_PROGRESS_RETRIES) throw cause;
          await wait(IN_PROGRESS_RETRY_MS);
        }
      }
    },
    [mutation],
  );

  const submit = useCallback(
    async (payload: FeedbackSubmitPayload): Promise<SubmitOutcome> => {
      setSubmitting(true);
      setGeneralError(null);
      try {
        const submitted = await send(payload, keyFor(payload));
        attemptRef.current = null;
        setResult(submitted);
        return { type: 'success', result: submitted };
      } catch (cause) {
        const error = toFeedbackApiError(cause);
        if (error.kind === 'validation') return { type: 'field_errors', errors: error.errors };
        if (error.kind === 'attachment') return { type: 'attachment_errors', errors: error.errors };
        if (error.kind === 'form_outdated') return { type: 'form_outdated' };
        if (error.kind === 'too_many') setBlockedSeconds(error.retryAfterSeconds);
        setGeneralError(generalMessage(error));
        return { type: 'failed' };
      } finally {
        setSubmitting(false);
      }
    },
    [send],
  );

  const reset = useCallback(() => {
    attemptRef.current = null;
    setResult(null);
    setGeneralError(null);
  }, []);

  return { submit, reset, submitting, result, generalError, setGeneralError, blockedSeconds };
}
