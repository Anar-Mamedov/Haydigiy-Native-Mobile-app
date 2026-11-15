import { CartLineItem } from '@/types/cart.types';
import { getCartLineKey, isGiftCartLine } from './cart-line';

/** Sepet listesinin bir kartı: satırın kendisi ve kartın altında gösterilen bağlı hediyeleri. */
export type CartLineGroup = {
  item: CartLineItem;
  gifts: CartLineItem[];
};

/**
 * Hediye satırlarını ait oldukları ücretli satırın kartına bağlar (web `groupCartGifts`).
 *
 * Hangi hediyenin hangi satıra ait olduğunu backend söyler (`parentLineKey`, `parent_cart_key`);
 * istemci kendi eşleştirme kuralını yazmaz. Ebeveyni sepette olmayan ya da anahtarı gelmeyen hediye
 * eskisi gibi kendi kartında kalır. Satır sırası korunur; bağlanan hediye listeden çıkıp
 * ebeveyninin altına geçer.
 */
export function groupCartGifts(items: CartLineItem[]): CartLineGroup[] {
  const parentKeys = new Set(items.filter((item) => !isGiftCartLine(item)).map(getCartLineKey));
  const parentKeyOf = (item: CartLineItem): string | null =>
    isGiftCartLine(item) && item.parentLineKey && parentKeys.has(item.parentLineKey)
      ? item.parentLineKey
      : null;

  const giftsByParent = new Map<string, CartLineItem[]>();
  for (const item of items) {
    const parentKey = parentKeyOf(item);
    if (parentKey) giftsByParent.set(parentKey, [...(giftsByParent.get(parentKey) ?? []), item]);
  }

  return items
    .filter((item) => parentKeyOf(item) === null)
    .map((item) => ({ item, gifts: giftsByParent.get(getCartLineKey(item)) ?? [] }));
}
