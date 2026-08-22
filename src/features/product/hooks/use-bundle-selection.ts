import { useCallback, useMemo, useState } from 'react';
import { BundleItem, BundleSelection } from '@/types/bundle.types';

/**
 * Bundle detayında paketteki her ürün için ayrı beden seçimini yönetir.
 * Kullanıcı TÜM ürünlerin bedenini seçmeden sepete ekleme yapılamaz.
 *
 * Otomatik seçim (tek bedeni olan ürün) render sırasında türetilir; effect içinde
 * setState yapılmaz, böylece zincirleme render oluşmaz.
 */
export function useBundleSelection(items: BundleItem[]) {
  // Yalnızca kullanıcının kendi seçimleri tutulur.
  const [manualSelections, setManualSelections] = useState<Record<number, string>>({});
  const [missingHighlight, setMissingHighlight] = useState(false);

  const selections = useMemo(() => {
    const next: Record<number, string> = {};

    items.forEach((item) => {
      // Tek bedeni olan (ve stokta olan) üründe beden otomatik seçilir.
      const inStock = item.variants.filter((variant) => variant.hasStock);
      if (inStock.length === 1) next[item.bundleItemId] = inStock[0].variantId;

      // Kullanıcının seçimi otomatik seçimi ezer; artık var olmayan varyant düşer.
      const manual = manualSelections[item.bundleItemId];
      if (manual && item.variants.some((variant) => variant.variantId === manual)) {
        next[item.bundleItemId] = manual;
      }
    });

    return next;
  }, [items, manualSelections]);

  const selectVariant = useCallback((bundleItemId: number, variantId: string) => {
    setMissingHighlight(false);
    setManualSelections((prev) => ({ ...prev, [bundleItemId]: variantId }));
  }, []);

  const missingItemIds = useMemo(
    () => items.filter((item) => !selections[item.bundleItemId]).map((item) => item.bundleItemId),
    [items, selections],
  );

  const selectedCount = items.length - missingItemIds.length;
  const isComplete = items.length > 0 && missingItemIds.length === 0;

  /** Paketteki her ürün satın alınabilir durumda mı? */
  const isPurchasable = useMemo(
    () => items.length > 0 && items.every((item) => item.isAvailable),
    [items],
  );

  const selectionPayload = useMemo<BundleSelection[]>(
    () =>
      items
        .map((item) => ({ bundleItemId: item.bundleItemId, variantId: selections[item.bundleItemId] }))
        .filter((selection): selection is BundleSelection => typeof selection.variantId === 'string'),
    [items, selections],
  );

  /** Eksik beden seçimlerini vurgular ve ilk eksik kalemin id'sini döner. */
  const flagMissingSelections = useCallback(() => {
    setMissingHighlight(true);
    return missingItemIds[0] ?? null;
  }, [missingItemIds]);

  const resetSelections = useCallback(() => {
    setManualSelections({});
    setMissingHighlight(false);
  }, []);

  return {
    selections,
    selectVariant,
    selectedCount,
    missingItemIds,
    missingHighlight,
    flagMissingSelections,
    resetSelections,
    isComplete,
    isPurchasable,
    selectionPayload,
  };
}
