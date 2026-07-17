import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { checkoutKeys } from '../api/checkout.keys';
import { cartKeys } from '@/features/cart/api/cart.keys';
import { useCartQuery } from '@/features/cart/api/cart.queries';
import {
  extractInitialCargoId,
  extractOrderToken,
  prepareOrderDto,
} from '@/services/order.service';

type PreparedCartStatus = 'waiting' | 'refreshing' | 'ready' | 'error';

/**
 * Reproduces the web checkout bootstrap order: prepare the draft order first,
 * then fetch a fresh cart snapshot. `/order/prepare` synchronizes cart prices on
 * the backend, so totals and user discounts must not become checkout-authoritative
 * until the following `/cart/list` request completes.
 */
export function useCheckoutBootstrap(fallbackOrderToken: string) {
  const queryClient = useQueryClient();
  const cartQuery = useCartQuery();
  const [preparedCartStatus, setPreparedCartStatus] = useState<PreparedCartStatus>('waiting');
  const refreshSequenceRef = useRef(0);

  const prepareQuery = useQuery({
    queryKey: [...checkoutKeys.all, 'prepare'],
    staleTime: 0,
    queryFn: async () => {
      const response = await prepareOrderDto();
      return {
        orderToken: extractOrderToken(response),
        cargoId: extractInitialCargoId(response),
      };
    },
  });

  const refetchCartQuery = cartQuery.refetch;
  const refreshPreparedCart = useCallback(async () => {
    const refreshSequence = ++refreshSequenceRef.current;
    setPreparedCartStatus('refreshing');

    try {
      const cartRequestWasAlreadyRunning =
        queryClient.getQueryState(cartKeys.list())?.fetchStatus === 'fetching';
      if (cartRequestWasAlreadyRunning) {
        await refetchCartQuery({ cancelRefetch: false });
      }

      const result = await refetchCartQuery();
      if (refreshSequenceRef.current === refreshSequence) {
        setPreparedCartStatus(result.isError ? 'error' : 'ready');
      }
    } catch {
      if (refreshSequenceRef.current === refreshSequence) {
        setPreparedCartStatus('error');
      }
    }
  }, [queryClient, refetchCartQuery]);

  useEffect(() => {
    if (!prepareQuery.isSuccess || prepareQuery.dataUpdatedAt === 0) return;

    void refreshPreparedCart();
    return () => {
      refreshSequenceRef.current += 1;
    };
  }, [prepareQuery.dataUpdatedAt, prepareQuery.isSuccess, refreshPreparedCart]);

  const isPrepareError = prepareQuery.isError;
  const refetchPrepare = prepareQuery.refetch;
  const retryCheckout = useCallback(async () => {
    if (isPrepareError) {
      setPreparedCartStatus('waiting');
      await refetchPrepare();
      return;
    }

    await refreshPreparedCart();
  }, [isPrepareError, refetchPrepare, refreshPreparedCart]);

  const isWaitingForPreparedCart =
    prepareQuery.isSuccess &&
    (preparedCartStatus === 'waiting' || preparedCartStatus === 'refreshing');

  return {
    cartData: cartQuery.data,
    initialCargoId: prepareQuery.data?.cargoId ?? null,
    isError:
      prepareQuery.isError ||
      preparedCartStatus === 'error' ||
      (cartQuery.isError && !cartQuery.data),
    isLoading:
      prepareQuery.isPending ||
      isWaitingForPreparedCart ||
      (cartQuery.isPending && !cartQuery.data),
    orderToken: prepareQuery.data?.orderToken || fallbackOrderToken || null,
    refetchCart: cartQuery.refetch,
    retryCheckout,
  };
}
