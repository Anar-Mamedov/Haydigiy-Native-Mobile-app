/**
 * Sepet satırı kimliği ve mutasyon hedefi.
 *
 * Normal ürünler `cart_item_id` (yoksa `variant_id`) ile, bundle satırları
 * `bundle_group_id` ile hedeflenir. Aynı varyantın ücretli ve hediye satırı ayrı
 * durabildiği ve bundle satırının `variant_id`'si olmadığı için satırlar listede
 * ve optimistic güncellemelerde `getCartLineKey` ile anahtarlanmalıdır;
 * `variantId` ile anahtarlamak iki satırın aynı kimliği paylaşmasına yol açar.
 */

import { BUNDLE_MAX_QUANTITY } from '@/features/bundle/api/bundle.mapper';
import { CartLineItem } from '@/types/cart.types';

/** Normal ürün satırı: `/cart/update` ve `/cart/remove` uçları. */
export type CartItemLineTarget = { kind: 'variant'; variantId: string; cartItemId?: string };

/** Bundle satırı: `/cart/bundles/{bundle_group_id}` uçları. */
export type BundleLineTarget = { kind: 'bundle'; bundleGroupId: string };

/** Adet ve silme isteklerinin hangi uca gideceğini belirleyen hedef. */
export type CartLineTarget = CartItemLineTarget | BundleLineTarget;

/** Satır bundle mı? */
export function isBundleCartLine(item: CartLineItem | null | undefined): boolean {
  if (!item) return false;
  return item.itemType === 'bundle' || Boolean(item.bundleGroupId);
}

/** Satırın tamamı ücretsiz kampanya hediyesi mi? */
export function isGiftCartLine(item: CartLineItem | null | undefined): boolean {
  return Boolean(item?.isGift) && !isBundleCartLine(item);
}

/**
 * Satırın adedi müşteri tarafından değiştirilebilir mi? Kampanya hediyesinin
 * adedini backend belirler (değiştirme isteği 422 döner); yalnız silinebilir.
 * Bu kural ekranlara ayrı ayrı yazılmaz, buradan okunur.
 */
export function canChangeCartLineQuantity(item: CartLineItem | null | undefined): boolean {
  return Boolean(item) && !isGiftCartLine(item);
}

/** Hedefin satır kimliği; `getCartLineKey` ile aynı anahtarı üretir. */
export function getCartLineTargetKey(target: CartLineTarget): string {
  if (target.kind === 'bundle') return `bundle:${target.bundleGroupId}`;
  return target.cartItemId ? `cart:${target.cartItemId}` : `variant:${target.variantId}`;
}

/** Liste render'ı ve optimistic güncellemeler için tekil satır kimliği. */
export function getCartLineKey(item: CartLineItem | null | undefined): string {
  if (!item) return 'unknown';
  const target = getCartLineTarget(item);
  if (target) return getCartLineTargetKey(target);
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

  if (!item.variantId) return null;
  return item.cartItemId
    ? { kind: 'variant', variantId: item.variantId, cartItemId: item.cartItemId }
    : { kind: 'variant', variantId: item.variantId };
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
