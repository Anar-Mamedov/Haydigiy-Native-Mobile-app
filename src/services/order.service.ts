import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

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
