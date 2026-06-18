import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { OrdersResponseDto, ReturnRequestsResponseDto } from '@/features/order/api/order.dtos';
import { OrderDetailResponseDto } from '@/features/order/api/order-detail.dtos';
import { OrderCategory, OrderDateFilter } from '@/types/order.types';

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

export interface OrderPrepareResponseDto {
  order_token?: string;
  token?: string;
  status?: string;
  data?: { order_token?: string };
  order?: { token?: string };
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
