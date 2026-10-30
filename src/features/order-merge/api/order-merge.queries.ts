import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getOrderMergeEligibilityDto } from '@/services/order-merge.service';
import { OrderMergeOffer } from '@/types/order-merge.types';
import { orderMergeKeys } from './order-merge.keys';
import { mapOrderMergeEligibility } from './order-merge.mapper';

/**
 * Loads the merge offer on demand (when the customer confirms the cart). The answer
 * depends on the cart and the order's warehouse state, so it is always fetched fresh
 * and never retried: a slow or failed check must not hold up the normal checkout.
 */
export function useOrderMergeOfferLoader(): () => Promise<OrderMergeOffer | null> {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.fetchQuery({
        queryKey: orderMergeKeys.eligibility(),
        queryFn: async () => mapOrderMergeEligibility(await getOrderMergeEligibilityDto()),
        staleTime: 0,
        gcTime: 0,
        retry: false,
      }),
    [queryClient],
  );
}
