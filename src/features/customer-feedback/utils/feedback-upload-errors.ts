import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';
import type { FeedbackApiError } from './feedback-api-error';

export type UploadFailure = { message: string; retryable: boolean };

/** Yükleme hatasının dosya satırındaki karşılığı (sözleşme v1.0 §5.2 hata tablosu). */
export function toUploadFailure(error: FeedbackApiError): UploadFailure {
  switch (error.kind) {
    case 'file_rejected':
      // Sunucu iletisi düz metindir (örn. "Video en çok 25 MB olabilir."); aynı dosyayı yeniden denemek anlamsız.
      return { message: error.errors.file || T.fileFailed, retryable: false };
    case 'too_many':
      return { message: T.uploadTooMany, retryable: true };
    case 'disabled':
      return { message: T.disabled, retryable: false };
    case 'form_outdated':
      return { message: T.formUpdated, retryable: false };
    case 'unavailable':
    case 'network':
      return { message: T.uploadStorageDown, retryable: true };
    default:
      return { message: T.fileFailed, retryable: true };
  }
}
