import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartKeys } from '@/features/cart/api/cart.keys';
import { orderKeys } from '@/features/order/api/order.keys';
import { mergeCartIntoCodOrderDto, prepareCardMergeDto } from '@/services/order-merge.service';
import {
  OrderMergeCardSession,
  OrderMergeCodResult,
  OrderMergeOffer,
} from '@/types/order-merge.types';
import { mapOrderMergeCardSession, mapOrderMergeCodResult } from './order-merge.mapper';

type MergeTarget = Pick<OrderMergeOffer, 'orderId' | 'orderNo'>;

/**
 * Adds the cart to a cash-on-delivery order. The backend empties the cart and
 * updates the order, so both the cart and the order caches are refreshed.
 */
export function useMergeCartIntoCodOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<OrderMergeCodResult, unknown, MergeTarget>({
    mutationFn: async ({ orderId, orderNo }) =>
      mapOrderMergeCodResult(await mergeCartIntoCodOrderDto(orderId), orderNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

/** Prepares the draft order whose difference is paid by card (cart stays until payment). */
export function usePrepareCardMergeMutation() {
  return useMutation<OrderMergeCardSession, unknown, MergeTarget>({
    mutationFn: async ({ orderId, orderNo }) =>
      mapOrderMergeCardSession(await prepareCardMergeDto(orderId), orderNo),
  });
}
