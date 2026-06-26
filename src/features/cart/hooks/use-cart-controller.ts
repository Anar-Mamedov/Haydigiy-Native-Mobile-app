import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { isAxiosError } from 'axios';
import {
  calculateCartItemCount,
  calculateCartSubtotal,
  useCartStore,
} from '@/features/cart/store/use-cart-store';
import {
  useCartQuery,
  useClearCartMutation,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from '@/features/cart/api/cart.queries';
import { useShippingEstimateQuery } from '@/features/shipping/api/shipping.queries';
import { useCheckoutMutation } from '@/features/checkout/api/checkout.mutations';
import { useAddFavoriteMutation } from '@/features/favorite/api/favorite.queries';
import { isAuthenticated } from '@/features/auth/api/auth-session';
import { CartCampaign, CartLineItem } from '@/types/cart.types';

const isOutOfStock = (message: string) =>
  message.toLocaleLowerCase('tr-TR').includes('stokta yok');

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return message ?? fallback;
  }
  return fallback;
}

/**
 * Orchestrates the fully server-backed cart screen. Reads come from TanStack
 * Query (`/cart/list`, `/shipping-estimate`) and every write goes through the
 * cart API (`/cart/update`, `/cart/remove`), mirroring the web cart. The item
 * count is derived from the loaded list so the header and the "Sepeti Onayla"
 * button always match the items shown. Checkout runs the same address-check then
 * `/order/prepare` flow.
 */
export function useCartController() {
  const router = useRouter();

  const cartQuery = useCartQuery();
  const shippingQuery = useShippingEstimateQuery();
  const items = useCartStore((state) => state.items);

  const updateMutation = useUpdateCartItemMutation();
  const removeMutation = useRemoveCartItemMutation();
  const clearMutation = useClearCartMutation();
  const checkoutMutation = useCheckoutMutation();
  const addFavorite = useAddFavoriteMutation();

  const [removeTarget, setRemoveTarget] = useState<CartLineItem | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [removedMessage, setRemovedMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const isCheckingOut = checkoutMutation.isPending;

  const campaigns: CartCampaign[] = cartQuery.data?.campaigns ?? [];

  // Surface the backend "items removed (out of stock)" notice once per fetch.
  useEffect(() => {
    if (cartQuery.data?.removedMessage) {
      setRemovedMessage(cartQuery.data.removedMessage);
    }
  }, [cartQuery.data?.removedMessage]);

  // Refetch the cart and keep a loading state until the server responds, so the
  // cart screen always shows a spinner on entry (and after add-to-cart) instead of
  // briefly rendering a stale list. A `token` tracks the active sync so a newer
  // entry never gets cleared by an older refetch's completion, and `.finally`
  // stops the spinner on both success and error (never stuck).
  const { refetch: refetchCart } = cartQuery;
  const syncTokenRef = useRef(0);
  const syncCart = useCallback(() => {
    const token = syncTokenRef.current + 1;
    syncTokenRef.current = token;
    setIsSyncing(true);
    refetchCart().finally(() => {
      if (syncTokenRef.current === token) {
        setIsSyncing(false);
      }
    });
  }, [refetchCart]);

  const itemCount = calculateCartItemCount(items);
  const subtotal = calculateCartSubtotal(items);
  const total = subtotal;

  const updatingVariantId =
    updateMutation.isPending ? updateMutation.variables?.variantId : undefined;

  const changeQuantity = useCallback(
    (item: CartLineItem, quantity: number) => {
      if (quantity < 1 || !item.variantId) return;
      const capped =
        typeof item.stock === 'number' && item.stock > 0
          ? Math.min(quantity, item.stock)
          : quantity;
      updateMutation.mutate({ variantId: item.variantId, quantity: capped });
    },
    [updateMutation],
  );

  const requestRemove = useCallback((item: CartLineItem) => {
    setRemoveTarget(item);
  }, []);

  const closeRemoveDialog = useCallback(() => {
    setRemoveTarget(null);
  }, []);

  const confirmRemove = useCallback(() => {
    const variantId = removeTarget?.variantId;
    if (!variantId) return;
    removeMutation.mutate(variantId);
    setRemoveTarget(null);
  }, [removeMutation, removeTarget]);

  const confirmRemoveAndFavorite = useCallback(() => {
    const variantId = removeTarget?.variantId;
    if (!removeTarget || !variantId) return;
    addFavorite.mutate(removeTarget.productId, { onError: () => undefined });
    removeMutation.mutate(variantId);
    setRemoveTarget(null);
  }, [addFavorite, removeMutation, removeTarget]);

  const requestClear = useCallback(() => {
    if (items.length === 0) return;
    setIsClearDialogOpen(true);
  }, [items.length]);

  const confirmClear = useCallback(() => {
    clearMutation.mutate();
    setIsClearDialogOpen(false);
  }, [clearMutation]);

  const toggleSummary = useCallback(() => {
    setIsSummaryExpanded((prev) => !prev);
  }, []);

  const dismissRemovedMessage = useCallback(() => {
    setRemovedMessage(null);
  }, []);

  const openProduct = useCallback(
    (item: CartLineItem) => {
      router.push(`/product/${item.slug ?? item.productId}` as never);
    },
    [router],
  );

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const checkout = useCallback(async () => {
    if (checkoutMutation.isPending || items.length === 0) return;

    if (!(await isAuthenticated())) {
      Alert.alert(
        'Giriş Yapın',
        'Sepeti onaylamak için hesabınıza giriş yapın veya ücretsiz üye olun.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => router.push('/(tabs)/profile') },
        ],
      );
      return;
    }

    try {
      const result = await checkoutMutation.mutateAsync();

      if (result.status === 'no_address') {
        Alert.alert(
          'Adres Gerekli',
          'Siparişi tamamlamak için önce bir teslimat adresi eklemelisiniz.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Profilime Git', onPress: () => router.push('/(tabs)/profile') },
          ],
        );
        return;
      }

      router.push({
        pathname: '/checkout',
        params: result.orderToken ? { orderToken: result.orderToken } : undefined,
      });
    } catch (error) {
      Alert.alert(
        isOutOfStock(getApiErrorMessage(error, '')) ? 'Sepette Stok Sorunu Var' : 'Hata',
        getApiErrorMessage(error, 'Sipariş hazırlanırken bir hata oluştu.'),
      );
    }
  }, [checkoutMutation, items.length, router]);

  return {
    items,
    itemCount,
    subtotal,
    total,
    campaigns,
    shippingEstimate: shippingQuery.data,
    // Async read state
    isLoading: cartQuery.isPending,
    isSyncing,
    isFetching: cartQuery.isFetching,
    isError: cartQuery.isError,
    refetch: cartQuery.refetch,
    syncCart,
    // Removed-items notice
    removedMessage,
    dismissRemovedMessage,
    // Mutation state
    updatingVariantId,
    // Dialog / UI state
    removeTarget,
    isClearDialogOpen,
    isSummaryExpanded,
    isCheckingOut,
    // Actions
    changeQuantity,
    requestRemove,
    closeRemoveDialog,
    confirmRemove,
    confirmRemoveAndFavorite,
    requestClear,
    setIsClearDialogOpen,
    confirmClear,
    toggleSummary,
    openProduct,
    goBack,
    checkout,
  };
}
