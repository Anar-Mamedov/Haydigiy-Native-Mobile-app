import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { OrdersResponseDto, ReturnRequestsResponseDto } from '@/features/order/api/order.dtos';
import { OrderDetailResponseDto } from '@/features/order/api/order-detail.dtos';
import {
  OrderCargoTrackingDataDto,
  OrderCargoTrackingResponseDto,
} from '@/features/order/api/order-tracking.dtos';
import {
  CancellationReasonDto,
  CancellationReasonsResponseDto,
  CancelErrorPayloadDto,
  CancelItemPayloadDto,
  CancelPreviewDto,
  CancelSubmitResponseDto,
} from '@/features/order/api/order-cancel.dtos';
import { mapCancelPreview } from '@/features/order/api/order-cancel.mapper';
import { CancelPreview, OrderCategory, OrderDateFilter } from '@/types/order.types';

const EMPTY_PAGE = { data: [], meta: { current_page: 1, last_page: 1, per_page: 0, total: 0 } };

type OrderListParams = {
  page: number;
  search?: string;
  category?: OrderCategory;
  dateFilter?: OrderDateFilter;
};

function buildOrderParams({ page, search, category, dateFilter }: OrderListParams) {
  const params: Record<string, string | number> = { page };
  if (search) params.search = search;
  if (category && category !== 'all') params.category = category;
  if (dateFilter && dateFilter !== 'all') params.date_filter = dateFilter;
  return params;
}

/** Orders list (`GET /order`) — used for the all / active / cancelled filters. */
export async function getOrdersDto(params: OrderListParams): Promise<OrdersResponseDto> {
  if (!appEnv.apiBaseUrl) return EMPTY_PAGE;

  const response = await apiClient.get<OrdersResponseDto>('/order', {
    params: buildOrderParams(params),
    headers: { Accept: 'application/json' },
  });
  return response.data ?? EMPTY_PAGE;
}

/** Return requests (`GET /return-requests`) — used for the "İadeler" filter. */
export async function getReturnRequestsDto(
  params: OrderListParams,
): Promise<ReturnRequestsResponseDto> {
  if (!appEnv.apiBaseUrl) return EMPTY_PAGE;

  const response = await apiClient.get<ReturnRequestsResponseDto>('/return-requests', {
    params: buildOrderParams(params),
    headers: { Accept: 'application/json' },
  });
  return response.data ?? EMPTY_PAGE;
}

/** Single order detail (`GET /order/{id}`). */
export async function getOrderByIdDto(id: number | string): Promise<OrderDetailResponseDto | null> {
  if (!appEnv.apiBaseUrl) return null;

  const response = await apiClient.get<OrderDetailResponseDto>(`/order/${id}`, {
    headers: { Accept: 'application/json' },
  });
  return response.data ?? null;
}

/** Cargo tracking details (`GET /order/{id}/cargo-tracking`). */
export async function getOrderCargoTrackingDto(
  id: number | string,
): Promise<OrderCargoTrackingDataDto | null> {
  if (!appEnv.apiBaseUrl) return null;

  const response = await apiClient.get<OrderCargoTrackingResponseDto | OrderCargoTrackingDataDto>(
    `/order/${id}/cargo-tracking`,
    {
      headers: { Accept: 'application/json' },
    },
  );
  const body = response.data;
  if (!body) return null;

  const wrappedBody = body as OrderCargoTrackingResponseDto;
  const directBody = body as OrderCargoTrackingDataDto;
  const data =
    wrappedBody.data ??
    (directBody.order || directBody.cargo_movements || directBody.cargo_status ? directBody : null);

  if (wrappedBody.success === false || (!data && 'success' in wrappedBody)) {
    throw new Error(wrappedBody.message || 'Kargo bilgisi alınamadı.');
  }

  return data;
}

/** Cancellation reasons (`GET /order/cancellation-reasons`). */
export async function getCancellationReasonsDto(): Promise<CancellationReasonDto[]> {
  if (!appEnv.apiBaseUrl) return [];
  const response = await apiClient.get<CancellationReasonsResponseDto>('/order/cancellation-reasons');
  return Array.isArray(response.data?.data) ? response.data.data : [];
}

/** Preview the financial impact of cancelling items (`POST /order/cancel-preview/{id}`). */
export async function previewOrderCancelDto(
  id: number | string,
  items: CancelItemPayloadDto[],
): Promise<CancelPreviewDto> {
  const response = await apiClient.post<CancelPreviewDto>(`/order/cancel-preview/${id}`, { items });
  return response.data;
}

/** Submit a cancellation (`POST /order/cancel/{id}`). */
export async function submitOrderCancelDto(
  id: number | string,
  items: CancelItemPayloadDto[],
  acknowledged?: boolean,
): Promise<CancelSubmitResponseDto> {
  const body: { items: CancelItemPayloadDto[]; acknowledged?: boolean } = { items };
  if (acknowledged) body.acknowledged = true;
  const response = await apiClient.post<CancelSubmitResponseDto>(`/order/cancel/${id}`, body);
  return response.data;
}

function extractPreviewFromError(data: CancelErrorPayloadDto | undefined): CancelPreview | null {
  if (!data) return null;
  const raw = data.preview ?? data;
  if (
    typeof raw.campaign_will_break !== 'boolean' &&
    typeof raw.cancellation_blocked !== 'boolean'
  ) {
    return null;
  }
  return mapCancelPreview(raw);
}

/** Detects the 409 "acknowledgement required" error and returns its preview. */
export function getAcknowledgementRequiredPreview(error: unknown): CancelPreview | null {
  if (!isAxiosError(error) || error.response?.status !== 409) return null;
  const data = error.response.data as CancelErrorPayloadDto | undefined;
  if (!data?.requires_acknowledgement) return null;
  return extractPreviewFromError(data);
}

/** Detects the 422 "cancellation blocked" error and returns its preview. */
export function getCancellationBlockedPreview(error: unknown): CancelPreview | null {
  if (!isAxiosError(error) || error.response?.status !== 422) return null;
  const data = error.response.data as CancelErrorPayloadDto | undefined;
  if (!data?.cancellation_blocked) return null;
  return extractPreviewFromError(data);
}

export function getCancelErrorMessage(error: unknown, fallback = 'Bir hata oluştu'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? fallback;
  }
  return fallback;
}

export interface OrderPrepareResponseDto {
  order_token?: string;
  token?: string;
  status?: string;
  data?: { order_token?: string };
  order?: { token?: string; cargo_id?: number | null };
}

/**
 * Asks the backend to prepare an order from the current cart. Mirrors the web
 * cart's `POST /order/prepare`, returning the order token used by the payment
 * flow. The backend also validates stock here (out-of-stock surfaces as an error).
 */
export async function prepareOrderDto(): Promise<OrderPrepareResponseDto | null> {
  if (!appEnv.apiBaseUrl) return null;

  const response = await apiClient.post<OrderPrepareResponseDto>('/order/prepare');
  return response.data ?? null;
}

export function extractOrderToken(response: OrderPrepareResponseDto | null): string | null {
  if (!response) return null;
  return (
    response.order_token ??
    response.data?.order_token ??
    response.token ??
    response.order?.token ??
    null
  );
}

/** Default cargo id the backend pre-set on the prepared order (web's `initialCargoId`). */
export function extractInitialCargoId(response: OrderPrepareResponseDto | null): number | null {
  const cargoId = response?.order?.cargo_id;
  return typeof cargoId === 'number' ? cargoId : null;
}
