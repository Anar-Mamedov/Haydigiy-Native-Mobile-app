/**
 * Sipariş iptal ve iade ekranlarının satır gruplaması.
 *
 * Bundle'ın içindeki ürünler tek tek seçilemez: paket ya bütün olarak iptal/iade edilir
 * ya da hiç edilmez. Bu yüzden aynı `bundleGroupId`'ye sahip sipariş satırları TEK bir
 * seçilebilir gruba indirilir; istek gönderilirken grup yeniden kendi gerçek `order_item`
 * kayıtlarına açılır. Normal ürünler eskisi gibi adet başına ayrı satır olur.
 */

import { BundleComponent } from '@/types/bundle.types';
import { OrderDetailItem } from '@/types/order.types';

/** Gruba dahil gerçek sipariş satırı — iptal/iade isteğinde bu kayıtlar gönderilir. */
export type OrderItemGroupMember = {
  orderItemId: number;
  quantity: number;
};

export type OrderItemGroup = {
  /** Seçim anahtarı. Normal üründe `{orderItemId}-{index}`, bundle'da `bundle:{groupId}`. */
  expandedId: string;
  /** Grubun görünen temsilcisi (ad, görsel, beden, fiyat). */
  item: OrderDetailItem;
  isBundle: boolean;
  /** Paket adedi (bundle olmayan satırda 1). */
  quantity: number;
  members: OrderItemGroupMember[];
  /** Bundle ise içindeki ürünler (yalnızca gösterim). */
  components: BundleComponent[];
  /**
   * Grup iade edilebilir mi? Bundle bütün olarak iade edildiği için TÜM bileşenlerin
   * iade edilebilir olması gerekir; biri bile kapalıysa paket kapalıdır.
   */
  isNonReturnable: boolean;
  /** Hediye ürün akışı için. Bundle'da ancak tüm bileşenler hediyeyse `gift_product`. */
  returnStatus?: string;
};

function toComponent(item: OrderDetailItem, index: number): BundleComponent {
  return {
    key: `${item.id}-${index}`,
    orderItemId: item.id,
    title: item.name,
    slug: item.slug || null,
    imageUrl: item.image ?? '',
    variantName: item.variantName || null,
    quantity: Math.max(1, item.quantity),
    price: item.price > 0 ? item.price : null,
  };
}

/**
 * Sipariş satırlarını iptal/iade ekranlarının seçilebilir gruplarına çevirir.
 *
 * @param items Siparişin GERÇEK satırları — iptal ve iade daima bunlar üzerinden yapılır.
 * @param displayItems Müşteri görünümü — paketin adı/görseli/tutarı buradan alınır.
 */
export function buildOrderItemGroups(
  items: OrderDetailItem[] | null | undefined,
  displayItems?: OrderDetailItem[] | null,
): OrderItemGroup[] {
  const safeItems = Array.isArray(items) ? items : [];
  const safeDisplayItems = Array.isArray(displayItems) ? displayItems : [];

  const groups: OrderItemGroup[] = [];
  const bundlesByGroupId = new Map<string, OrderItemGroup>();
  // Bundle gruplarının iade durumu tüm bileşenlere bakılarak hesaplanır.
  const flags = new Map<
    string,
    { allReturnable: boolean; allGift: boolean; nonGiftStatus?: string; hasDisplayPrice: boolean }
  >();

  safeItems.forEach((item) => {
    if (!item || typeof item.id !== 'number') return;

    const quantity = Math.max(1, item.quantity);
    const groupId = item.bundleGroupId;

    // --- Bundle bileşeni: aynı gruba katılır ---
    if (groupId) {
      let group = bundlesByGroupId.get(groupId);

      if (!group) {
        const display = safeDisplayItems.find((entry) => entry.bundleGroupId === groupId);

        group = {
          expandedId: `bundle:${groupId}`,
          item: {
            ...item,
            id: item.id,
            name: display?.name || 'Paket Ürün',
            variantName: display?.variantName || '',
            slug: display?.slug || '',
            image: display?.image ?? item.image,
            price: display?.price ?? 0,
            quantity: display?.quantity ?? 1,
            isBundle: true,
            bundleComponents: [],
          },
          isBundle: true,
          quantity: display?.quantity ?? 1,
          members: [],
          components: [],
          isNonReturnable: false,
          returnStatus: item.returnStatus,
        };

        bundlesByGroupId.set(groupId, group);
        flags.set(groupId, {
          allReturnable: true,
          allGift: true,
          hasDisplayPrice: (display?.price ?? 0) > 0,
        });
        groups.push(group);
      }

      group.members.push({ orderItemId: item.id, quantity });
      group.components.push(toComponent(item, group.components.length));
      // Satır bileşeni de paket içeriğini taşır: sipariş detayı doğrudan `item` render eder.
      group.item = { ...group.item, bundleComponents: group.components };

      const flag = flags.get(groupId);
      if (flag) {
        flag.allReturnable = flag.allReturnable && item.isNonReturnable !== true;
        flag.allGift = flag.allGift && item.returnStatus === 'gift_product';
        // Hediye olmayan ilk durum saklanır: paketin tamamı hediye değilse grup da hediye sayılmaz.
        if (item.returnStatus !== 'gift_product' && flag.nonGiftStatus === undefined) {
          flag.nonGiftStatus = item.returnStatus;
        }

        group.isNonReturnable = !flag.allReturnable;
        group.returnStatus = flag.allGift ? 'gift_product' : flag.nonGiftStatus;

        // display_items paketin tutarını vermediyse bileşenlerden toplanır.
        if (!flag.hasDisplayPrice) {
          group.item = {
            ...group.item,
            price: group.members.reduce((sum, member) => {
              const source = safeItems.find((entry) => entry.id === member.orderItemId);
              return sum + (source?.price ?? 0) * member.quantity;
            }, 0),
          };
        }
      }

      return;
    }

    // --- Normal ürün: adet kadar ayrı satır (mevcut davranış korunur) ---
    for (let index = 0; index < quantity; index += 1) {
      groups.push({
        expandedId: `${item.id}-${index}`,
        item,
        isBundle: false,
        quantity: 1,
        members: [{ orderItemId: item.id, quantity: 1 }],
        components: [],
        isNonReturnable: item.isNonReturnable === true,
        returnStatus: item.returnStatus,
      });
    }
  });

  return groups;
}

/** Seçilen grupları gerçek `order_item` kayıtlarına açar (istek gövdesi için). */
export function expandGroupsToMembers(
  groups: OrderItemGroup[],
  selectedIds: string[],
): OrderItemGroupMember[] {
  return selectedIds.flatMap((expandedId) => {
    const group = groups.find((entry) => entry.expandedId === expandedId);
    return group ? group.members : [];
  });
}
