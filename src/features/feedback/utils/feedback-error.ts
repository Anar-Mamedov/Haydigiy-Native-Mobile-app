import { isAxiosError } from 'axios';
import { getApiErrorMessage } from '@/utils/api-error';
import { FEEDBACK_TEXTS } from '../constants/feedback-texts';

/**
 * Gönderim hatasının kullanıcı mesajı. Web backend mesajını aynen basıyor; ancak
 * 404/5xx yanıtlarında Laravel'in İngilizce teknik metni ("The route ... could not
 * be found.") geliyor. Yalnızca doğrulama (422) mesajları gösterilir, gerisi web'in
 * yedek metnine düşer.
 */
export function getFeedbackErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 422) {
    return getApiErrorMessage(error, FEEDBACK_TEXTS.sendError);
  }
  return FEEDBACK_TEXTS.sendError;
}
