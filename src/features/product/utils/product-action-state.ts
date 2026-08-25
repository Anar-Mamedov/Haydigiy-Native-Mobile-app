export type ProductActionState = 'add-to-cart' | 'notify-available' | 'notify-requested';

type ProductActionInput = {
  isApprovedForSale: boolean;
  isNotified: boolean;
  /** Bir beden seçili VE o bedenin stoğu yok. */
  isOutOfStock: boolean;
};

/**
 * Ürün detayındaki birincil aksiyonun hangi duruma düşeceğini belirler.
 * Karar tek yerde tutuluyor; alt bar ve beden seçim sheet'i aynı sonucu
 * kendi görsel diliyle çiziyor. Sıra web ile birebir aynı.
 *
 * Oturum durumu bu karara girmez: misafir de "Gelince Haber Ver"i görür,
 * butona basınca `useNotifyStock` önce girişe yönlendirip talebi giriş
 * sonrasında otomatik gönderir.
 */
export function resolveProductActionState({
  isApprovedForSale,
  isNotified,
  isOutOfStock,
}: ProductActionInput): ProductActionState {
  // Satışa kapalı ürün stok bildirimine de açık değil.
  if (!isApprovedForSale || !isOutOfStock) return 'add-to-cart';
  if (isNotified) return 'notify-requested';

  return 'notify-available';
}
