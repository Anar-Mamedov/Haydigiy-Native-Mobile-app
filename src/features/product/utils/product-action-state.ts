export type ProductActionState =
  | 'add-to-cart'
  | 'notify-available'
  | 'notify-requested'
  | 'sold-out-guest';

type ProductActionInput = {
  isApprovedForSale: boolean;
  isAuthenticated: boolean;
  isNotified: boolean;
  /** Bir beden seçili VE o bedenin stoğu yok. */
  isOutOfStock: boolean;
};

/**
 * Ürün detayındaki birincil aksiyonun hangi duruma düşeceğini belirler.
 * Karar tek yerde tutuluyor; alt bar ve beden seçim sheet'i aynı sonucu
 * kendi görsel diliyle çiziyor. Sıra web ile birebir aynı.
 */
export function resolveProductActionState({
  isApprovedForSale,
  isAuthenticated,
  isNotified,
  isOutOfStock,
}: ProductActionInput): ProductActionState {
  // Satışa kapalı ürün stok bildirimine de açık değil.
  if (!isApprovedForSale || !isOutOfStock) return 'add-to-cart';
  if (!isAuthenticated) return 'sold-out-guest';
  if (isNotified) return 'notify-requested';

  return 'notify-available';
}
