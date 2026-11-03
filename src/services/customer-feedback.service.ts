import type { AxiosProgressEvent } from 'axios';
import { apiClient } from '@/lib/axios';
import type { FeedbackSubmitPayload } from '@/types/customer-feedback.types';

/**
 * Müşteri Geri Bildirim uçları (connect, sözleşme v1.0 §5). Oturum isteğe bağlıdır: `apiClient` üye
 * token'ını ekler, misafirde istek misafir sayılır. `upload_token` ve `Idempotency-Key` loglanmaz.
 */

const FORMS_TIMEOUT_MS = 10_000;
const SUBMIT_TIMEOUT_MS = 20_000;
export const IMAGE_UPLOAD_TIMEOUT_MS = 60_000;
export const VIDEO_UPLOAD_TIMEOUT_MS = 180_000;

/** `GET /customer-feedback/forms?context=general` ham cevabının `data`'sı. */
export type FeedbackFormDto = Record<string, unknown>;

export type FeedbackUploadDto = {
  upload_token?: string;
  mime_type?: string;
  file_size?: number;
};

export type FeedbackSubmitDto = {
  success?: boolean;
  /** `reference` geçiş süresince gelir; müşteriye gösterilmez (sözleşme v1.1 §3). */
  data?: { id?: string; reference?: string };
  duplicate?: boolean;
};

/** React Native multipart dosya parçası. */
export type FeedbackUploadFile = { uri: string; name: string; type: string };

export async function getFeedbackFormDto(): Promise<FeedbackFormDto | null> {
  const response = await apiClient.get<{ data?: FeedbackFormDto }>('/customer-feedback/forms', {
    params: { context: 'general' },
    timeout: FORMS_TIMEOUT_MS,
  });
  return response.data?.data ?? null;
}

type UploadParams = {
  file: FeedbackUploadFile;
  categoryKey: string;
  fieldKey: string;
  timeout: number;
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
};

export async function uploadFeedbackAttachmentDto({
  file,
  categoryKey,
  fieldKey,
  timeout,
  signal,
  onProgress,
}: UploadParams): Promise<FeedbackUploadDto> {
  const form = new FormData();
  form.append('file', file as unknown as Blob);
  form.append('context', 'general');
  form.append('category_key', categoryKey);
  form.append('field_key', fieldKey);

  const response = await apiClient.post<{ data?: FeedbackUploadDto }>('/customer-feedback/attachments', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout,
    signal,
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    },
  });
  return response.data?.data ?? {};
}

export async function submitCustomerFeedbackDto(
  payload: FeedbackSubmitPayload,
  idempotencyKey: string,
): Promise<FeedbackSubmitDto> {
  const response = await apiClient.post<FeedbackSubmitDto>('/customer-feedback', payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
    timeout: SUBMIT_TIMEOUT_MS,
  });
  return response.data ?? {};
}
