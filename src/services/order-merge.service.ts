import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import {
  OrderMergeCardPrepareResponseDto,
  OrderMergeCodResponseDto,
  OrderMergeEligibilityDto,
} from '@/features/order-merge/api/order-merge.dtos';

/**
 * Whether the cart can be added to the customer's approved order
 * (`GET /order/merge-eligible`). The backend also returns the modal texts.
 */
export async function getOrderMergeEligibilityDto(): Promise<OrderMergeEligibilityDto | null> {
  if (!appEnv.apiBaseUrl) return null;

  const response = await apiClient.get<OrderMergeEligibilityDto>('/order/merge-eligible', {
    headers: { Accept: 'application/json' },
  });
  return response.data ?? null;
}

/**
 * Adds the cart to a cash-on-delivery order (`POST /order/merge-cod`). The backend
 * empties the cart; stock and warehouse-lock failures come back as 422 + `message`.
 */
export async function mergeCartIntoCodOrderDto(orderId: number): Promise<OrderMergeCodResponseDto> {
  const response = await apiClient.post<OrderMergeCodResponseDto>('/order/merge-cod', {
    order_id: orderId,
  });
  return response.data ?? {};
}

/**
 * Prepares the draft order for the card payment of the difference
 * (`POST /order/merge-card-prepare`): free cargo, the approved order's installments.
 */
export async function prepareCardMergeDto(
  orderId: number,
): Promise<OrderMergeCardPrepareResponseDto> {
  const response = await apiClient.post<OrderMergeCardPrepareResponseDto>(
    '/order/merge-card-prepare',
    { order_id: orderId },
  );
  return response.data ?? {};
}
