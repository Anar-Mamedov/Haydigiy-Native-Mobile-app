import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartKeys } from './cart.keys';
import {
  mapAvailableGifts,
  mapCartCampaignBannerStatus,
  mapCartCampaignDto,
  mapCartResponse,
} from './cart.mapper';
import { calculateCartItemCount, useCartStore } from '../store/use-cart-store';
import {
  addBundleToCartDto,
  addCartGiftDto,
  addToCartDto,
  getCartCampaignsDto,
  getCartDto,
  removeBundleDto,
  removeCartItemDto,
  updateBundleQuantityDto,
  updateCartItemDto,
} from '@/services/cart.service';
import {
  CartItemLineTarget,
  CartLineTarget,
  getCartLineKey,
  getCartLineTargetKey,
} from '@/features/cart/utils/cart-line';
import { BundleSelection } from '@/types/bundle.types';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import { InsiderProductInput } from '@/features/insider/utils/insider-product.mapper';
import { analytics } from '@/features/analytics/services/analytics-dispatcher';
import {
  cartItemToAnalyticsProduct,
  trackingSnapshotToAnalyticsProduct,
} from '@/features/analytics/utils/analytics-product.mapper';
import { AvailableGift, CartLineItem } from '@/types/cart.types';

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
        availableGifts: mapAvailableGifts(dto.available_gifts),
        userDiscount: Number(dto.user_discount ?? 0),
        removedMessage: hasRemoved ? dto.message ?? 'Sepetiniz güncellendi.' : null,
      };
    },
    staleTime: 30_000,
  });
}

/**
 * Ürün listesi ekranındaki sepet kampanya bandının verisi. `categoryId`
 * listelenen kategoridir; backend kategoriye özel hediye kampanyasını buna göre
 * döndürür, bu yüzden anahtarın parçasıdır.
 *
 * Anahtar `cartKeys.all` altında olduğu için sepet mutasyonlarının ve oturum
 * değişiminde `CartHydrator`'ın yaptığı invalidation bu sorguyu da tazeler —
 * web'deki `[authState, cartCount]` bağımlılığının karşılığıdır.
 *
 * Bant kritik olmayan bir dönüşüm bileşenidir: gösterilecek kampanya yoksa
 * `null` döner ve bant hiç render edilmez. İstek hatası TanStack Query'nin
 * `error` durumunda tutulur, sessizce yutulmaz; UI ise ekranı bozmamak için
 * bandı gizler.
 */
export function useCartCampaignBannerQuery(categoryId?: number) {
  return useQuery({
    queryKey: cartKeys.campaigns(categoryId),
    queryFn: async () => mapCartCampaignBannerStatus(await getCartCampaignsDto(categoryId)),
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

/** `cartItemId` varsa sayıya çevrilir; yoksa istek varyant üzerinden gider. */
function toCartItemIdParam(target: CartItemLineTarget): number | undefined {
  return target.cartItemId ? Number(target.cartItemId) : undefined;
}

/**
 * Normal ürün satırının adedini günceller. Satır `cart_item_id` ile hedeflenir;
 * aynı varyantın hediye satırı varsa iyimser güncelleme ona dokunmaz.
 */
export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ target, quantity }: { target: CartItemLineTarget; quantity: number }) =>
      updateCartItemDto(Number(target.variantId), quantity, toCartItemIdParam(target)),
    onMutate: ({ target, quantity }) => {
      const previous = useCartStore.getState().items;
      const lineKey = getCartLineTargetKey(target);
      useCartStore.getState().setItems(
        previous.map((item) => (getCartLineKey(item) === lineKey ? { ...item, quantity } : item)),
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

/**
 * Normal ürün satırını siler. `cart_item_id` ile yalnız hedeflenen satır silinir;
 * olmadan backend varyantın ücretli ve hediye satırlarını birlikte siler.
 */
export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (target: CartItemLineTarget) =>
      removeCartItemDto(Number(target.variantId), toCartItemIdParam(target)),
    onMutate: (target) => {
      const previous = useCartStore.getState().items;
      const lineKey = getCartLineTargetKey(target);
      useCartStore.getState().setItems(previous.filter((item) => getCartLineKey(item) !== lineKey));
      return { previous };
    },
    onError: (_error, _target, context) => {
      if (context?.previous) rollbackTo(context.previous);
    },
    onSuccess: (_data, target, context) => {
      const lineKey = getCartLineTargetKey(target);
      const removed = context?.previous.find((item) => getCartLineKey(item) === lineKey);
      if (!removed) return;
      insiderTracker.trackRemoveFromCart(removed.productId);
      analytics.track({ name: 'remove_from_cart', product: cartItemToAnalyticsProduct(removed) });
      // Insider: removing the last line also counts as clearing the cart.
      const remaining = context.previous.filter((item) => getCartLineKey(item) !== lineKey);
      if (remaining.length === 0) {
        insiderTracker.trackCartCleared();
        analytics.track({ name: 'cart_cleared', itemCount: 0 });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

/**
 * Clears the whole cart by removing every line on the backend (there is no bulk
 * clear endpoint), mirroring the web cart. The line targets are captured by the
 * caller and passed in, because `onMutate` empties the store optimistically and
 * runs *before* `mutationFn` — reading the store here would see an empty cart and
 * delete nothing. Bundle lines resolve to the bundle endpoint, normal lines to the
 * variant endpoint (see `getCartLineTarget`). A single failed removal rejects the mutation so the optimistic
 * empty is rolled back and the caller can surface the error instead of failing
 * silently.
 */
export function useClearCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targets: CartLineTarget[]) => {
      const results = await Promise.allSettled(
        targets.map((target) =>
          // Bundle satırı tek parça silinir; içindeki ürünler ayrı satır değildir.
          target.kind === 'bundle'
            ? removeBundleDto(target.bundleGroupId)
            : removeCartItemDto(Number(target.variantId), toCartItemIdParam(target)),
        ),
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
    onSuccess: (_data, _variables, context) => {
      insiderTracker.trackCartCleared();
      analytics.track({ name: 'cart_cleared', itemCount: context?.previous.length ?? 0 });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

/**
 * Bundle adedini günceller. `variant_id` ile çalışan `/cart/update` bundle için
 * kullanılmaz; paket satırı yalnızca `bundle_group_id` ile hedeflenebilir.
 */
export function useUpdateBundleQuantityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bundleGroupId, quantity }: { bundleGroupId: string; quantity: number }) =>
      updateBundleQuantityDto(bundleGroupId, quantity),
    onMutate: ({ bundleGroupId, quantity }) => {
      const previous = useCartStore.getState().items;
      const lineKey = getCartLineTargetKey({ kind: 'bundle', bundleGroupId });
      useCartStore.getState().setItems(
        previous.map((item) => (getCartLineKey(item) === lineKey ? { ...item, quantity } : item)),
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

/** Bundle'ı sepetten tek parça olarak siler. */
export function useRemoveBundleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bundleGroupId: string) => removeBundleDto(bundleGroupId),
    onMutate: (bundleGroupId) => {
      const previous = useCartStore.getState().items;
      const lineKey = getCartLineTargetKey({ kind: 'bundle', bundleGroupId });
      useCartStore.getState().setItems(previous.filter((item) => getCartLineKey(item) !== lineKey));
      return { previous };
    },
    onError: (_error, _bundleGroupId, context) => {
      if (context?.previous) rollbackTo(context.previous);
    },
    onSuccess: (_data, bundleGroupId, context) => {
      const lineKey = getCartLineTargetKey({ kind: 'bundle', bundleGroupId });
      const removed = context?.previous.find((item) => getCartLineKey(item) === lineKey);
      if (!removed) return;
      insiderTracker.trackRemoveFromCart(removed.productId);
      analytics.track({ name: 'remove_from_cart', product: cartItemToAnalyticsProduct(removed) });
      const remaining = context.previous.filter((item) => getCartLineKey(item) !== lineKey);
      if (remaining.length === 0) {
        insiderTracker.trackCartCleared();
        analytics.track({ name: 'cart_cleared', itemCount: 0 });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

/**
 * Bundle'ı sepete ekler. Paketteki HER ürün için beden seçilmiş olmalıdır; eksik
 * seçimle çağrılmaz (doğrulama `useBundleSelection` tarafında yapılır).
 */
export function useAddBundleToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bundleProductId,
      selections,
      quantity = 1,
    }: {
      bundleProductId: string;
      selections: BundleSelection[];
      quantity?: number;
      /** Insider add-to-cart snapshot; bundle tek ürün olarak raporlanır. */
      tracking?: InsiderProductInput;
    }) => addBundleToCartDto(Number(bundleProductId), selections, quantity),
    onSuccess: (_data, variables) => {
      if (!variables.tracking) return;
      insiderTracker.trackAddToCart(variables.tracking);
      analytics.track({
        name: 'add_to_cart',
        product: trackingSnapshotToAnalyticsProduct(variables.tracking),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

/**
 * Müşterinin seçtiği bedenle hak ettiği hediyeyi sepete ücretsiz ekler.
 *
 * İyimser güncelleme yapılmaz: hediye satırı ve kalan teklifler backend'in
 * doğrulamasına bağlıdır. Başarıda da hatada da sepet ve kampanyalar tazelenir;
 * hata anında stok ya da kampanya hakkı değişmiş olabilir. Hediye eklemesi web
 * ile aynı şekilde add-to-cart olayı olarak raporlanmaz.
 */
export function useAddCartGiftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gift, variantId }: { gift: AvailableGift; variantId: string }) =>
      addCartGiftDto({
        campaignId: Number(gift.campaignId),
        productId: Number(gift.productId),
        variantId: Number(variantId),
        quantity: gift.quantity,
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
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
      if (!variables.tracking) return;
      insiderTracker.trackAddToCart(variables.tracking);
      analytics.track({
        name: 'add_to_cart',
        product: trackingSnapshotToAnalyticsProduct(variables.tracking),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
