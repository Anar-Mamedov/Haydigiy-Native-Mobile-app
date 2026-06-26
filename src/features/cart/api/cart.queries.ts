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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useClearCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const items = useCartStore.getState().items;
      const variantIds = items
        .map((item) => item.variantId)
        .filter((id): id is string => Boolean(id));
      await Promise.allSettled(variantIds.map((id) => removeCartItemDto(Number(id))));
    },
    onMutate: () => {
      const previous = useCartStore.getState().items;
      useCartStore.getState().setItems([]);
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

export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, quantity = 1 }: { variantId: string; quantity?: number }) =>
      addToCartDto(Number(variantId), quantity),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
