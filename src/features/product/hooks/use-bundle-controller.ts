import { useCallback, useMemo, useState } from 'react';
import { useAddBundleToCartMutation } from '@/features/cart/api/cart.queries';
import { productToInsiderInput } from '@/features/insider/utils/insider-product.mapper';
import { BundleItem, BundleSummary } from '@/types/bundle.types';
import { Product } from '@/types/product.types';
import { getApiErrorMessage } from '@/utils/api-error';
import { useBundleSelection } from './use-bundle-selection';

const ADD_ERROR_FALLBACK = 'Paket sepete eklenemedi. Lütfen tekrar deneyin.';

export type UseBundleControllerOptions = {
  /** Paket gerçekten sepete eklendikten sonra çalışır (ör. sepete yönlendirme). */
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
  /** Paketteki ürünün detayına gider (görsel veya "Ürüne Git"). */
  openItemProduct: (item: BundleItem) => void;
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

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openSheet = useCallback(() => setSheetOpen(true), []);

  const closeSheet = useCallback(() => {
    setErrorMessage(null);
    setSheetOpen(false);
  }, []);

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
    selection,
  };
}
