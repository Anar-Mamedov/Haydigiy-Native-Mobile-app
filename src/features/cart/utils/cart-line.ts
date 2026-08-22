/**
 * Sepet satırı kimliği ve mutasyon hedefi.
 *
 * Normal ürünler `variant_id` ile, bundle satırları `bundle_group_id` ile hedeflenir.
 * Bundle satırının `variant_id`'si olmadığı için satırlar listede ve optimistic
 * güncellemelerde `getCartLineKey` ile anahtarlanmalıdır; `variantId` ile anahtarlamak
 * iki paketin aynı `undefined` kimliği paylaşmasına yol açar.
 */

import { BUNDLE_MAX_QUANTITY } from '@/features/bundle/api/bundle.mapper';
import { CartLineItem } from '@/types/cart.types';

/** Adet ve silme isteklerinin hangi uca gideceğini belirleyen hedef. */
export type CartLineTarget =
  | { kind: 'variant'; variantId: string }
  | { kind: 'bundle'; bundleGroupId: string };

/** Satır bundle mı? */
export function isBundleCartLine(item: CartLineItem | null | undefined): boolean {
  if (!item) return false;
  return item.itemType === 'bundle' || Boolean(item.bundleGroupId);
}

/** Liste render'ı ve optimistic güncellemeler için tekil satır kimliği. */
export function getCartLineKey(item: CartLineItem | null | undefined): string {
  if (!item) return 'unknown';
  if (isBundleCartLine(item) && item.bundleGroupId) return `bundle:${item.bundleGroupId}`;
  return `variant:${item.variantId ?? 'unknown'}`;
}

/**
 * Satırın hangi uçla güncelleneceğini/silineceğini döner.
 * Hedef çözülemiyorsa `null` döner ve çağıran isteği hiç göndermez.
 */
export function getCartLineTarget(item: CartLineItem | null | undefined): CartLineTarget | null {
  if (!item) return null;

  if (isBundleCartLine(item)) {
    // Bundle'da `variant_id` ile çalışan uçlar KULLANILMAZ.
    return item.bundleGroupId ? { kind: 'bundle', bundleGroupId: item.bundleGroupId } : null;
  }

  return item.variantId ? { kind: 'variant', variantId: item.variantId } : null;
}

/**
 * Satırın çıkabileceği en yüksek adet.
 * Normal üründe stok adedi; bundle'da backend stok göndermezse sabit üst sınır.
 */
export function getCartLineMaxQuantity(item: CartLineItem | null | undefined): number {
  const stock = item?.stock;
  if (typeof stock === 'number' && stock > 0) return stock;
  return isBundleCartLine(item) ? BUNDLE_MAX_QUANTITY : 0;
}
