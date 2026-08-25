/**
 * Sipariş detayının müşteri görünümü satırları.
 *
 * Paket, listede TEK satır olarak basılır ve içindeki ürünler `bundleComponents`
 * altında salt okunur listelenir. Seçim yapılmaz: iptal/iade seçimi
 * `order-item-groups` modülünün işidir.
 */

import { OrderDetailItem } from '@/types/order.types';
import {
  groupOrderLines,
  sumLinePrices,
  toBundleComponents,
  type OrderLineGroup,
} from './order-bundle-lines';

function toBundleRow(group: OrderLineGroup): OrderDetailItem {
  const [firstMember] = group.members;
  const display = group.display;
  const components = toBundleComponents(group.members);
  const displayPrice = display?.price ?? 0;

  return {
    ...firstMember,
    name: display?.name || 'Paket Ürün',
    variantName: display?.variantName || '',
    slug: display?.slug || '',
    image: display?.image ?? firstMember.image,
    // display_items paketin tutarını vermediyse bileşenlerden toplanır.
    price: displayPrice > 0 ? displayPrice : sumLinePrices(group.members),
    quantity: display?.quantity ?? 1,
    isBundle: true,
    bundleComponents: components,
  };
}

/**
 * Sipariş satırlarını müşteri görünümüne çevirir: paketler tek satıra iner,
 * normal ürünler olduğu gibi (adet bilgisiyle birlikte) kalır.
 */
export function buildOrderDisplayRows(
  items: OrderDetailItem[] | null | undefined,
  displayItems?: OrderDetailItem[] | null,
): OrderDetailItem[] {
  return groupOrderLines(items, displayItems).map((group) =>
    group.bundleGroupId ? toBundleRow(group) : group.members[0],
  );
}
