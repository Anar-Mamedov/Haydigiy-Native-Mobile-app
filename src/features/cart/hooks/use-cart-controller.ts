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
  useRemoveBundleMutation,
  useRemoveCartItemMutation,
  useUpdateBundleQuantityMutation,
  useUpdateCartItemMutation,
} from '@/features/cart/api/cart.queries';
import { useShippingEstimateQuery } from '@/features/shipping/api/shipping.queries';
import { useCheckoutMutation } from '@/features/checkout/api/checkout.mutations';
import { useAddFavoriteMutation } from '@/features/favorite/api/favorite.queries';
import { cartItemToInsiderInput } from '@/features/insider/utils/insider-product.mapper';
import { isAuthenticated } from '@/features/auth/api/auth-session';
import { CartCampaign, CartLineItem } from '@/types/cart.types';
import {
  CartLineTarget,
  getCartLineMaxQuantity,
  getCartLineTarget,
} from '@/features/cart/utils/cart-line';

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
  const updateBundleMutation = useUpdateBundleQuantityMutation();
  const removeBundleMutation = useRemoveBundleMutation();
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

  /**
   * Güncellenmekte olan satırın kimliği. Bundle satırlarının `variant_id`'si
   * olmadığı için satır kimliği (`getCartLineKey`) üzerinden takip edilir.
   */
  const updatingLineKey = updateMutation.isPending
    ? `variant:${updateMutation.variables?.variantId}`
    : updateBundleMutation.isPending
    ? `bundle:${updateBundleMutation.variables?.bundleGroupId}`
    : undefined;

  const changeQuantity = useCallback(
    (item: CartLineItem, quantity: number) => {
      if (quantity < 1) return;

      const target = getCartLineTarget(item);
      if (!target) return;

      const maxQuantity = getCartLineMaxQuantity(item);
      const capped = maxQuantity > 0 ? Math.min(quantity, maxQuantity) : quantity;

      // Bundle'da variant_id ile çalışan /cart/update kullanılmaz.
      if (target.kind === 'bundle') {
        updateBundleMutation.mutate({ bundleGroupId: target.bundleGroupId, quantity: capped });
        return;
      }

      updateMutation.mutate({ variantId: target.variantId, quantity: capped });
    },
    [updateBundleMutation, updateMutation],
  );

  const requestRemove = useCallback((item: CartLineItem) => {
    setRemoveTarget(item);
  }, []);

  const closeRemoveDialog = useCallback(() => {
    setRemoveTarget(null);
  }, []);

  /** Satırı kendi ucundan siler: bundle `bundle_group_id`, normal ürün `variant_id`. */
  const removeLine = useCallback(
    (item: CartLineItem) => {
      const target = getCartLineTarget(item);
      if (!target) return false;

      if (target.kind === 'bundle') {
        removeBundleMutation.mutate(target.bundleGroupId);
      } else {
        removeMutation.mutate(target.variantId);
      }
      return true;
    },
    [removeBundleMutation, removeMutation],
  );

  const confirmRemove = useCallback(() => {
    if (!removeTarget) return;
    if (!removeLine(removeTarget)) return;
    setRemoveTarget(null);
  }, [removeLine, removeTarget]);

  const confirmRemoveAndFavorite = useCallback(() => {
    if (!removeTarget) return;
    addFavorite.mutate(
      {
        productId: removeTarget.productId,
        tracking: cartItemToInsiderInput(removeTarget),
      },
      { onError: () => undefined },
    );
    if (!removeLine(removeTarget)) return;
    setRemoveTarget(null);
  }, [addFavorite, removeLine, removeTarget]);

  const requestClear = useCallback(() => {
    if (items.length === 0) return;
    setIsClearDialogOpen(true);
  }, [items.length]);

  const confirmClear = useCallback(() => {
    // Snapshot the line targets *before* the optimistic clear empties the store,
    // so every line is actually removed on the backend (not just hidden locally).
    // Bundle satırları bundle ucuna, normal satırlar variant ucuna yönlenir.
    const targets = items
      .map(getCartLineTarget)
      .filter((target): target is CartLineTarget => target !== null);

    setIsClearDialogOpen(false);
    if (targets.length === 0) return;

    clearMutation.mutate(targets, {
      onError: () => {
        Alert.alert(
          'Hata',
          'Sepet temizlenirken bir hata oluştu. Lütfen tekrar deneyin.',
        );
      },
    });
  }, [clearMutation, items]);

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

  /** Paket içeriğindeki bir ürüne dokunulduğunda o ürünün detayına gider. */
  const openProductBySlug = useCallback(
    (slug: string | null) => {
      if (!slug) return;
      router.push(`/product/${slug}` as never);
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
          { text: 'Giriş Yap', onPress: () => router.push('/profile') },
        ],
      );
      return;
    }

    try {
      const result = await checkoutMutation.mutateAsync();

      if (result.status === 'no_address') {
        // Push the add-address form directly; its save handler calls
        // `router.back()`, so the user lands back on the cart to continue.
        Alert.alert(
          'Adres Gerekli',
          'Siparişi tamamlamak için önce bir teslimat adresi eklemelisiniz.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Adres Ekle', onPress: () => router.push('/address-form') },
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
    updatingLineKey,
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
    openProductBySlug,
    goBack,
    checkout,
  };
}
