import { CartLineItem } from '@/types/cart.types';

/**
 * Sipariş gönderilirken sepet satırlarının kopyasını saklar. Ödeme başarı
 * ekranı açıldığında sepet çoktan invalidate edilmiş (boşalmış) olabileceği
 * için satın alma (Insider purchase) eventi bu anlık görüntüden beslenir.
 * `consume` tek seferliktir; aynı sipariş için mükerrer event üretilmez.
 */
let pendingItems: CartLineItem[] | null = null;

export function setPurchaseSnapshot(items: CartLineItem[]): void {
  pendingItems = items.map((item) => ({ ...item }));
}

export function consumePurchaseSnapshot(): CartLineItem[] | null {
  const items = pendingItems;
  pendingItems = null;
  return items;
}

export function clearPurchaseSnapshot(): void {
  pendingItems = null;
}
