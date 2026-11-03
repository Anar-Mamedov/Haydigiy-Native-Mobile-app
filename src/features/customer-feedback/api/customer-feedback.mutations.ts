import { useMutation } from '@tanstack/react-query';
import {
  submitCustomerFeedbackDto,
  uploadFeedbackAttachmentDto,
  type FeedbackUploadFile,
} from '@/services/customer-feedback.service';
import type { FeedbackSubmitPayload, FeedbackSubmitResult, FeedbackUploadResult } from '@/types/customer-feedback.types';

export type UploadAttachmentVariables = {
  file: FeedbackUploadFile;
  categoryKey: string;
  fieldKey: string;
  timeout: number;
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
};

/**
 * Tek dosya yükler (`POST /customer-feedback/attachments`). Yeniden deneme kullanıcıya bırakılır:
 * sunucu geçersiz denemeleri de oran sınırına sayar.
 */
export function useUploadFeedbackAttachmentMutation() {
  return useMutation<FeedbackUploadResult, unknown, UploadAttachmentVariables>({
    retry: false,
    mutationFn: async (variables) => {
      const dto = await uploadFeedbackAttachmentDto(variables);
      if (!dto.upload_token) throw new Error('customer-feedback: upload without token');
      return { uploadToken: dto.upload_token, mimeType: dto.mime_type ?? '', fileSize: dto.file_size ?? 0 };
    },
  });
}

export type SubmitFeedbackVariables = { payload: FeedbackSubmitPayload; idempotencyKey: string };

/**
 * Başvuruyu gönderir (`POST /customer-feedback`). Otomatik yeniden deneme YOK: tekrarlar aynı
 * `Idempotency-Key` ile `useFeedbackSubmit` içinde yönetilir. Başarı `success: true` ile anlaşılır;
 * takip numarası (`data.reference`) gösterilmediği için sunucu onu kaldırınca da akış bozulmaz (v1.1 §3).
 */
export function useSubmitCustomerFeedbackMutation() {
  return useMutation<FeedbackSubmitResult, unknown, SubmitFeedbackVariables>({
    retry: false,
    mutationFn: async ({ payload, idempotencyKey }) => {
      const dto = await submitCustomerFeedbackDto(payload, idempotencyKey);
      if (dto.success !== true) throw new Error('customer-feedback: submit without success');
      return { duplicate: dto.duplicate === true };
    },
  });
}
