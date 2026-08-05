import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartKeys } from './cart.keys';
import { mapCartCampaignDto, mapCartResponse } from './cart.mapper';
import { calculateCartItemCount, useCartStore } from '../store/use-cart-store';
import {
  addToCartDto,
  getCartDto,
  removeCartItemDto,
  updateCartItemDto,
} from '@/services/cart.service';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import { InsiderProductInput } from '@/features/insider/utils/insider-product.mapper';
import { CartLineItem } from '@/types/cart.types';

/**
 * Fetches the account (or guest) cart from the backend and hydrates the Zustand
 * store, which is the single source of truth for both the cart screen list and
 * every cart badge. Mounted at the app root (CartHydrator) and on the cart
 * screen; mutations refresh it via invalidation.
 */
export function useCartQuery() {
  const setItems = useCartStore((state) => state.setItems);

  return useQuery({
    queryKey: cartKeys.list(),
    queryFn: async () => {
      const dto = await getCartDto();
      const items = mapCartResponse(dto.cart);
      const campaigns = (dto.campaigns ?? []).map(mapCartCampaignDto);
      setItems(items);

      const hasRemoved =
        Boolean(dto.message) || (Array.isArray(dto.removed_items) && dto.removed_items.length > 0);

      return {
        items,
        campaigns,
        userDiscount: Number(dto.user_discount ?? 0),
        removedMessage: hasRemoved ? dto.message ?? 'Sepetiniz güncellendi.' : null,
      };
    },
    staleTime: 30_000,
  });
}

/**
 * Single source of truth for the cart item count shown by every badge (tab bar,
 * headers, product screens). Ensures the cart is fetched/hydrated, then derives
 * the count from the store so it always matches the items the user sees.
 */
export function useCartCount(): number {
  useCartQuery();
  return useCartStore((state) => calculateCartItemCount(state.items));
}

function rollbackTo(items: CartLineItem[]) {
  useCartStore.getState().setItems(items);
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) =>
      updateCartItemDto(Number(variantId), quantity),
    onMutate: ({ variantId, quantity }) => {
      const previous = useCartStore.getState().items;
      useCartStore.getState().setItems(
        previous.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) rollbackTo(context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: string) => removeCartItemDto(Number(variantId)),
    onMutate: (variantId) => {
      const previous = useCartStore.getState().items;
      useCartStore.getState().setItems(
        previous.filter((item) => item.variantId !== variantId),
      );
      return { previous };
    },
    onError: (_error, _variantId, context) => {
      if (context?.previous) rollbackTo(context.previous);
    },
    onSuccess: (_data, variantId, context) => {
      const removed = context?.previous.find((item) => item.variantId === variantId);
      if (!removed) return;
      insiderTracker.trackRemoveFromCart(removed.productId);
      // Insider: removing the last line also counts as clearing the cart.
      const remaining = context.previous.filter((item) => item.variantId !== variantId);
      if (remaining.length === 0) insiderTracker.trackCartCleared();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

/**
 * Clears the whole cart by removing every line on the backend (there is no bulk
 * clear endpoint), mirroring the web cart. The variant ids are captured by the
 * caller and passed in, because `onMutate` empties the store optimistically and
 * runs *before* `mutationFn` — reading the store here would see an empty cart and
 * delete nothing. A single failed removal rejects the mutation so the optimistic
 * empty is rolled back and the caller can surface the error instead of failing
 * silently.
 */
export function useClearCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variantIds: number[]) => {
      const results = await Promise.allSettled(
        variantIds.map((id) => removeCartItemDto(id)),
      );
      if (results.some((result) => result.status === 'rejected')) {
        throw new Error('Sepet temizlenirken bir hata oluştu.');
      }
    },
    onMutate: () => {
      const previous = useCartStore.getState().items;
      useCartStore.getState().setItems([]);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) rollbackTo(context.previous);
    },
    onSuccess: () => {
      insiderTracker.trackCartCleared();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      variantId,
      quantity = 1,
    }: {
      variantId: string;
      quantity?: number;
      /** Insider add-to-cart snapshot; callers with product context pass it. */
      tracking?: InsiderProductInput;
    }) => addToCartDto(Number(variantId), quantity),
    onSuccess: (_data, variables) => {
      if (variables.tracking) insiderTracker.trackAddToCart(variables.tracking);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
