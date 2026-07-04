import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import {
  ReturnReasonDto,
  ReturnReasonsResponseDto,
  ReturnSubmitResponseDto,
} from '@/features/order/api/return.dtos';
import { toReturnItemPayload } from '@/features/order/api/return.mapper';
import { ReturnMethod, ReturnSubmitItem } from '@/types/order.types';

// Photo uploads can exceed the 15s global timeout on slow connections, so the
// submit/recreate calls override it — matching the web flow's 300s allowance.
const UPLOAD_TIMEOUT = 300000;

export interface SubmitReturnRequestPayload {
  orderId: number | string;
  cargoCompany: ReturnMethod;
  note?: string;
  iban?: string;
  ibanName?: string;
  items: ReturnSubmitItem[];
}

/** Return reasons (`GET /return-requests/reasons`). */
export async function getReturnReasonsDto(): Promise<ReturnReasonDto[]> {
  if (!appEnv.apiBaseUrl) return [];
  const response = await apiClient.get<ReturnReasonsResponseDto>('/return-requests/reasons');
  return Array.isArray(response.data?.data) ? response.data.data : [];
}

function buildReturnFormData(payload: SubmitReturnRequestPayload): FormData {
  const form = new FormData();
  form.append('order_id', String(payload.orderId));
  form.append('cargo_company', payload.cargoCompany);
  if (payload.note?.trim()) form.append('reason', payload.note.trim());
  if (payload.iban) form.append('iban', payload.iban);
  if (payload.ibanName) form.append('iban_name', payload.ibanName);

  payload.items.forEach((item, index) => {
    const dto = toReturnItemPayload(item);
    form.append(`items[${index}][order_item_id]`, String(dto.order_item_id));
    form.append(`items[${index}][quantity]`, String(dto.quantity));
    form.append(`items[${index}][return_reason_id]`, String(dto.return_reason_id));
    if (item.photo) {
      // React Native multipart file part.
      form.append(`items[${index}][photo]`, {
        uri: item.photo.uri,
        name: item.photo.name,
        type: item.photo.type,
      } as unknown as Blob);
    }
  });

  return form;
}

/** Submit a return request (`POST /return-requests`) as multipart form data. */
export async function submitReturnRequestDto(
  payload: SubmitReturnRequestPayload,
): Promise<ReturnSubmitResponseDto> {
  const response = await apiClient.post<ReturnSubmitResponseDto>(
    '/return-requests',
    buildReturnFormData(payload),
    { headers: { 'Content-Type': 'multipart/form-data' }, timeout: UPLOAD_TIMEOUT },
  );
  return response.data ?? {};
}

/**
 * Re-create a failed Hepsijet return as a PTT return. When a return request
 * already exists (`returnRequestId`), the backend converts it; otherwise the
 * full multipart payload is re-submitted with `cargo_company=ptt`.
 */
export async function recreateReturnAsPttDto(
  returnRequestId: number | null,
  payload: SubmitReturnRequestPayload,
): Promise<ReturnSubmitResponseDto> {
  if (returnRequestId) {
    const response = await apiClient.post<ReturnSubmitResponseDto>(
      `/return-requests/${returnRequestId}/recreate-ptt`,
      undefined,
      // PTT SOAP servisi de global 15 sn zaman aşımını aşabilir.
      { timeout: UPLOAD_TIMEOUT },
    );
    return response.data ?? {};
  }
  return submitReturnRequestDto({ ...payload, cargoCompany: 'ptt' });
}

/** Cancels a pending return request (`DELETE /return-requests/{id}`), web parity. */
export async function cancelReturnRequestDto(
  returnRequestId: number,
): Promise<{ message?: string }> {
  const response = await apiClient.delete<{ message?: string }>(
    `/return-requests/${returnRequestId}`,
  );
  return response.data ?? {};
}

export function getReturnErrorMessage(error: unknown, fallback = 'İade talebi gönderilemedi.'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
