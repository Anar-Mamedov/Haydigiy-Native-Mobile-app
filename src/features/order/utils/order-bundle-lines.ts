/**
 * Sipariş satırlarının paket (bundle) gruplaması — ortak çekirdek.
 *
 * Aynı `bundleGroupId`'ye sahip `order_item` kayıtları TEK bir paket grubudur.
 * Bu modül yalnızca gruplamayı bilir; grubun nasıl gösterileceğine (sipariş
 * detayı) ya da nasıl seçileceğine (iptal/iade) karışmaz — o kararlar
 * `order-display-rows` ve `order-item-groups` modüllerine aittir.
 */

import { BundleComponent } from '@/types/bundle.types';
import { OrderDetailItem } from '@/types/order.types';

export type OrderLineGroup = {
  /** Kararlı liste anahtarı: `bundle:{groupId}` ya da `item:{orderItemId}`. */
  key: string;
  /** Paket grubuysa paketin kimliği, değilse null. */
  bundleGroupId: string | null;
  /** Gruba ait GERÇEK sipariş satırları — iptal/iade daima bunlarla yapılır. */
  members: OrderDetailItem[];
  /** Paketin müşteri görünümü (ad, görsel, tutar). `display_items` yoksa null. */
  display: OrderDetailItem | null;
};

/** Satırın kapsadığı adet; backend 0/eksik gönderse bile en az 1 kabul edilir. */
export function getLineQuantity(item: OrderDetailItem): number {
  return Math.max(1, item.quantity);
}

/**
 * Sipariş satırlarını paket gruplarına ayırır. Grup sırası, satırların siparişte
 * ilk göründükleri sırayı korur.
 *
 * @param items Siparişin gerçek satırları.
 * @param displayItems Müşteri görünümü — paketin adı/görseli/tutarı buradan gelir.
 */
export function groupOrderLines(
  items: OrderDetailItem[] | null | undefined,
  displayItems?: OrderDetailItem[] | null,
): OrderLineGroup[] {
  const safeItems = Array.isArray(items) ? items : [];
  const safeDisplayItems = Array.isArray(displayItems) ? displayItems : [];

  const groups: OrderLineGroup[] = [];
  const bundlesByGroupId = new Map<string, OrderLineGroup>();

  safeItems.forEach((item) => {
    if (!item || typeof item.id !== 'number') return;

    const bundleGroupId = item.bundleGroupId || null;

    if (!bundleGroupId) {
      groups.push({
        key: `item:${item.id}`,
        bundleGroupId: null,
        members: [item],
        display: null,
      });
      return;
    }

    const existing = bundlesByGroupId.get(bundleGroupId);
    if (existing) {
      existing.members.push(item);
      return;
    }

    const group: OrderLineGroup = {
      key: `bundle:${bundleGroupId}`,
      bundleGroupId,
      members: [item],
      display: safeDisplayItems.find((entry) => entry.bundleGroupId === bundleGroupId) ?? null,
    };
    bundlesByGroupId.set(bundleGroupId, group);
    groups.push(group);
  });

  return groups;
}

/** Paket satırlarını salt gösterim bileşenlerine çevirir. */
export function toBundleComponents(members: OrderDetailItem[]): BundleComponent[] {
  return members.map((member, index) => ({
    key: `${member.id}-${index}`,
    orderItemId: member.id,
    title: member.name,
    slug: member.slug || null,
    imageUrl: member.image ?? '',
    variantName: member.variantName || null,
    quantity: getLineQuantity(member),
    price: member.price > 0 ? member.price : null,
  }));
}

/** `display_items` paketin tutarını vermediğinde bileşenlerden toplanan fiyat. */
export function sumLinePrices(members: OrderDetailItem[]): number {
  return members.reduce((sum, member) => sum + (member.price ?? 0) * getLineQuantity(member), 0);
}
