import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartKeys } from '@/features/cart/api/cart.keys';
import { reorderOrderDto } from '@/services/order.service';
import { ReorderResult } from '@/types/order.types';
import { mapReorderResponse } from './order-reorder.mapper';

export type ReorderVariables = {
  orderId: string;
  /** True once the customer accepted that sold-out lines are skipped. */
  confirmed?: boolean;
};

/**
 * "Siparişi Tekrarla": asks the backend to copy the order's in-stock lines into the
 * cart. When lines were added — or the outcome is unknown because the request failed
 * mid-flight — the cart queries are invalidated like every add-to-cart mutation;
 * `CartHydrator` then refetches and re-hydrates the persisted cart store, so every
 * cart badge shows the new count.
 */
export function useReorderMutation() {
  const queryClient = useQueryClient();

  return useMutation<ReorderResult, unknown, ReorderVariables>({
    mutationFn: async ({ orderId, confirmed = false }) =>
      mapReorderResponse(await reorderOrderDto(orderId, confirmed)),
    onSettled: (result) => {
      // Onay bekleyen ya da hiç stok olmayan yanıtta sepete bir şey eklenmedi.
      if (result && result.kind !== 'added') return;
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
