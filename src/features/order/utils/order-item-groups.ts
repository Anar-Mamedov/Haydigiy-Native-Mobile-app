/**
 * Sipariş iptal ve iade ekranlarının seçim listesi.
 *
 * Paket (bundle) satırları GÖRSEL olarak tek grupta toplanır, ama grubun içindeki
 * her ürün tek tek seçilebilir: kullanıcı paketten yalnızca bir ürünü de iptal/iade
 * edebilir, tamamını da. İstek her zaman gerçek `order_item` kayıtlarıyla gider.
 *
 * Normal ürünler de aynı kuralla, adet başına bir satır olarak açılır.
 */

import { OrderDetailItem } from '@/types/order.types';
import {
  getLineQuantity,
  groupOrderLines,
  sumLinePrices,
  type OrderLineGroup,
} from './order-bundle-lines';

/** Tek başına seçilebilen birim: bir `order_item` kaydının bir adedi. */
export type OrderItemSelectionRow = {
  /** Seçim anahtarı: `{orderItemId}-{unitIndex}`. */
  expandedId: string;
  /** Satırın kendi ürünü — paket bileşeni de kendi adı ve bedeniyle görünür. */
  item: OrderDetailItem;
  orderItemId: number;
  /** Satırın kapsadığı adet — her zaman 1. */
  quantity: number;
  isNonReturnable: boolean;
  /** `available` | `gift_product` | diğer backend etiketi. */
  returnStatus?: string;
  /** Satır bir paketin içinden mi geliyor? */
  isBundleComponent: boolean;
};

/** Paket grubunun başlığı — paketin kendi adı, görseli ve tutarı. */
export type OrderItemGroupHeader = {
  title: string;
  /** Backend'in paket için gönderdiği etiket (örn. "4 ürün"); yoksa boş. */
  subtitle: string;
  imageUrl: string | null;
  /** Paketin toplam tutarı. */
  price: number;
  /** Kaç paket sipariş edildi. */
  quantity: number;
};

/** Ekranda tek kart olarak basılan grup: ya tek ürün ya da bir paket. */
export type OrderItemGroup = {
  /** Kararlı liste anahtarı: `bundle:{groupId}` ya da `item:{orderItemId}`. */
  groupId: string;
  isBundle: boolean;
  /** Yalnızca paket gruplarında dolu. */
  header: OrderItemGroupHeader | null;
  rows: OrderItemSelectionRow[];
};

function toSelectionRows(members: OrderDetailItem[], isBundleComponent: boolean): OrderItemSelectionRow[] {
  return members.flatMap((member) =>
    Array.from({ length: getLineQuantity(member) }, (_, index) => ({
      expandedId: `${member.id}-${index}`,
      item: member,
      orderItemId: member.id,
      quantity: 1,
      isNonReturnable: member.isNonReturnable === true,
      returnStatus: member.returnStatus,
      isBundleComponent,
    })),
  );
}

function toBundleHeader(group: OrderLineGroup): OrderItemGroupHeader {
  const display = group.display;
  const displayPrice = display?.price ?? 0;

  return {
    title: display?.name || 'Paket Ürün',
    subtitle: display?.variantName || '',
    imageUrl: display?.image ?? group.members[0]?.image ?? null,
    // display_items paketin tutarını vermediyse bileşenlerden toplanır.
    price: displayPrice > 0 ? displayPrice : sumLinePrices(group.members),
    quantity: display?.quantity ?? 1,
  };
}

function toItemGroup(group: OrderLineGroup): OrderItemGroup {
  const isBundle = group.bundleGroupId !== null;

  return {
    groupId: group.key,
    isBundle,
    header: isBundle ? toBundleHeader(group) : null,
    rows: toSelectionRows(group.members, isBundle),
  };
}

/**
 * Sipariş satırlarını iptal/iade ekranlarının seçim gruplarına çevirir.
 *
 * @param items Siparişin GERÇEK satırları — iptal ve iade daima bunlar üzerinden yapılır.
 * @param displayItems Müşteri görünümü — paket başlığının adı/görseli/tutarı buradan alınır.
 */
export function buildOrderItemGroups(
  items: OrderDetailItem[] | null | undefined,
  displayItems?: OrderDetailItem[] | null,
): OrderItemGroup[] {
  return groupOrderLines(items, displayItems).map(toItemGroup);
}

/** Gruplardaki tüm seçilebilir satırlar, ekrandaki sırayla. */
export function flattenGroupRows(groups: OrderItemGroup[]): OrderItemSelectionRow[] {
  return groups.flatMap((group) => group.rows);
}

/**
 * Satırları verilen koşula göre süzer; hiç satırı kalmayan grup listeden düşer.
 * (İade ekranı yalnızca iade edilebilir satırları gösterir.)
 */
export function filterGroupRows(
  groups: OrderItemGroup[],
  predicate: (row: OrderItemSelectionRow) => boolean,
): OrderItemGroup[] {
  return groups
    .map((group) => ({ ...group, rows: group.rows.filter(predicate) }))
    .filter((group) => group.rows.length > 0);
}

/** Grubun tüm satır anahtarları — "paketin tamamını seç" için. */
export function getGroupRowIds(group: OrderItemGroup): string[] {
  return group.rows.map((row) => row.expandedId);
}

/** Verilen `order_item` kaydını içeren grup. */
export function findGroupByOrderItemId(
  groups: OrderItemGroup[],
  orderItemId: number,
): OrderItemGroup | null {
  return groups.find((group) => group.rows.some((row) => row.orderItemId === orderItemId)) ?? null;
}

/**
 * `?item_id=` ile açılan ekranda önden işaretlenecek satırlar.
 *
 * Sipariş detayında paket TEK satır olarak gösterildiği için "Ürünü İptal Et"
 * paketin tamamını kasteder: paket grubunun bütün satırları işaretlenir, kullanıcı
 * istemediklerini tek tek kaldırabilir. Normal üründe eskisi gibi tek adet seçilir.
 */
export function getPreselectRowIds(group: OrderItemGroup): string[] {
  if (group.isBundle) return getGroupRowIds(group);
  const firstRow = group.rows[0];
  return firstRow ? [firstRow.expandedId] : [];
}
