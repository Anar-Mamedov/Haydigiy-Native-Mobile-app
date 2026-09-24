import { useCallback, useMemo, useState } from 'react';
import { useAddBundleToCartMutation, useAddToCartMutation } from '@/features/cart/api/cart.queries';
import { buildInsiderInput, productToInsiderInput } from '@/features/insider/utils/insider-product.mapper';
import { BundleItem, BundleSummary } from '@/types/bundle.types';
import { Product } from '@/types/product.types';
import { getApiErrorMessage } from '@/utils/api-error';
import { useBundleSelection } from './use-bundle-selection';
import { useTransientValue } from './use-transient-value';

const ADD_ERROR_FALLBACK = 'Paket sepete eklenemedi. Lütfen tekrar deneyin.';
const SINGLE_ADD_ERROR_FALLBACK = 'Ürün sepete eklenemedi. Lütfen tekrar deneyin.';
/** Tekli eklemeden sonra butonda "Tekli Ürün Eklendi" yazısının kalma süresi (webdekiyle aynı). */
export const SINGLE_ADDED_FEEDBACK_MS = 1500;

export type UseBundleControllerOptions = {
  /** Paket sepete gerçekten eklenince çalışır (ör. sepete yönlendirme). Tekli eklemede çağrılmaz. */
  onAdded: () => void;
  /** Paketteki bir ürünün detayını açar; rota kararı çağırana aittir. */
  onOpenProduct: (slug: string) => void;
};

export type BundleController = {
  /** Ürün paket mi ve içinde gösterilecek kalem var mı? */
  isBundle: boolean;
  items: BundleItem[];
  summary: BundleSummary | null;
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  isAdding: boolean;
  /** Sepete ekleme başarısız olduysa kullanıcıya gösterilecek mesaj. */
  errorMessage: string | null;
  confirmAdd: () => void;
  /** Paketteki ürünün detayına gider (görsele dokunulunca ya da bedensiz "Tekli Satın Al"da). */
  openItemProduct: (item: BundleItem) => void;
  /**
   * "Tekli Satın Al": bedeni seçilmiş kalemi paketsiz, tek başına sepete ekler ve webdeki gibi alt
   * sayfada kalır. Beden seçilmemişse beden orada seçilsin diye ürün detayına gider.
   */
  buySingleItem: (item: BundleItem) => void;
  /** Tekli sepete ekleme isteği süren kalemin id'si; istek yoksa null. */
  buyingItemId: number | null;
  /** Az önce tek başına sepete eklenen kalemin id'si; kısa süre sonra kendiliğinden null olur. */
  addedItemId: number | null;
  selection: ReturnType<typeof useBundleSelection>;
};

/**
 * Bundle ürün detayının tüm iş mantığı: paket kalemlerini toplar, beden seçimlerini
 * `useBundleSelection`'a devreder, alt sayfayı yönetir ve paketi sepete ekler.
 *
 * Ürün detay ekranı yalnızca sunum yapar; paketle ilgili durum burada durur.
 */
export function useBundleController(
  product: Product | null | undefined,
  { onAdded, onOpenProduct }: UseBundleControllerOptions,
): BundleController {
  const items = useMemo(() => product?.bundleItems ?? [], [product?.bundleItems]);
  const summary = product?.bundleSummary ?? null;
  const isBundle = Boolean(product?.isBundle) && items.length > 0;

  const selection = useBundleSelection(items);
  const addBundleToCart = useAddBundleToCartMutation();
  const addToCart = useAddToCartMutation();

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [buyingItemId, setBuyingItemId] = useState<number | null>(null);
  const addedItem = useTransientValue<number>(SINGLE_ADDED_FEEDBACK_MS);
  const clearAddedItem = addedItem.clear;
  const showAddedItem = addedItem.show;

  const openSheet = useCallback(() => setSheetOpen(true), []);

  const closeSheet = useCallback(() => {
    setErrorMessage(null);
    clearAddedItem();
    setSheetOpen(false);
  }, [clearAddedItem]);

  /**
   * Paketi sepete ekler. Eksik beden varsa istek gönderilmez; eksik kalemler
   * vurgulanır ve alt sayfa açık kalır (kullanıcı ne yapması gerektiğini görür).
   */
  const confirmAdd = useCallback(() => {
    if (!product || !selection.isComplete) {
      selection.flagMissingSelections();
      return;
    }

    setErrorMessage(null);
    addBundleToCart.mutate(
      {
        bundleProductId: product.id,
        selections: selection.selectionPayload,
        quantity: 1,
        // Bundle analitikte TEK ürün olarak raporlanır; bileşenler ayrı satır sayılmaz.
        tracking: productToInsiderInput(product, { quantity: 1 }),
      },
      {
        // Yalnızca istek gerçekten başarılı olduğunda sepete geçilir.
        onSuccess: () => {
          setSheetOpen(false);
          onAdded();
        },
        // Hata sessizce yutulmaz: alt sayfa açık kalır ve mesaj gösterilir.
        onError: (error) => setErrorMessage(getApiErrorMessage(error, ADD_ERROR_FALLBACK)),
      },
    );
  }, [addBundleToCart, onAdded, product, selection]);

  /**
   * Paketteki ürünün detayına gider. Alt sayfa modal olduğu için önce kapatılır; açık kalırsa
   * yeni ekranın üstünde görünür. Geri dönüldüğünde beden seçimleri yerinde kalır.
   */
  const openItemProduct = useCallback(
    (item: BundleItem) => {
      if (!item.slug) return;
      closeSheet();
      onOpenProduct(item.slug);
    },
    [closeSheet, onOpenProduct],
  );

  const buySingleItem = useCallback(
    (item: BundleItem) => {
      // Tek istek: çift dokunma ürünü iki kez eklemesin, istek sürerken başka ekrana da geçilmesin.
      if (addToCart.isPending) return;

      const variantId = selection.selections[item.bundleItemId];
      if (!variantId) {
        openItemProduct(item);
        return;
      }

      const variant = item.variants.find((option) => option.variantId === variantId);
      setErrorMessage(null);
      setBuyingItemId(item.bundleItemId);
      addToCart.mutate(
        {
          // Paketteki beden id'si ürüne özel `product_variant_id`'dir; tekli sepet de aynı id'yi bekler.
          variantId,
          tracking: buildInsiderInput({
            id: item.productId != null ? String(item.productId) : '',
            name: item.title,
            imageUrl: item.imageUrl,
            // Kalem paketsiz eklendiği için paket içi fiyat değil, normal birim fiyat raporlanır.
            price: item.regularUnitPrice,
            size: variant?.name,
            quantity: 1,
            slug: item.slug ?? undefined,
          }),
        },
        {
          // Webdeki gibi sepete geçilmez: kullanıcı paketin yanında kalır, buton kısa süre
          // "Tekli Ürün Eklendi" yazar. Hata sessizce yutulmaz, alt sayfada gösterilir.
          onSuccess: () => showAddedItem(item.bundleItemId),
          onError: (error) => setErrorMessage(getApiErrorMessage(error, SINGLE_ADD_ERROR_FALLBACK)),
          onSettled: () => setBuyingItemId(null),
        },
      );
    },
    [addToCart, openItemProduct, selection.selections, showAddedItem],
  );

  return {
    isBundle,
    items,
    summary,
    isSheetOpen,
    openSheet,
    closeSheet,
    isAdding: addBundleToCart.isPending,
    errorMessage,
    confirmAdd,
    openItemProduct,
    buySingleItem,
    buyingItemId,
    addedItemId: addedItem.value,
    selection,
  };
}
