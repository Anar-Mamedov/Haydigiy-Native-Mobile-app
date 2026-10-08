/**
 * Sipariş detayındaki iade kartlarının gruplanması — web sipariş detayının
 * (m/hesabim/siparislerim/[id]) `returnDisplayGroups` mantığının 1:1 portu:
 *
 * - Her iade talebi (`returnRequestId`) kendi kartında gösterilir.
 * - Ödemesi tamamlanan (durum 7) talepler tek bir "İade Tamamlandı" kartında
 *   birleşir ve listenin sonuna eklenir; bu kartta iade kodu gösterilmez.
 * - Kalan ürünler `items` / `displayItems` üzerinden zaten listelenir; iade
 *   kayıtları o listeden hiçbir satırı düşürmez.
 */

import { OrderDetailItem } from '@/types/order.types';
import {
  getReturnStatusDetails,
  isPendingReturn,
  RETURN_COMPLETED_STATUS,
} from './return-status';

export const COMPLETED_RETURNS_GROUP_KEY = 'completed-returns';

export type ReturnRequestGroup = {
  /** Liste anahtarı: talep id'si ya da birleştirilmiş tamamlananlar kartı. */
  key: string;
  /** İptal edilecek talep; birleştirilmiş tamamlananlar kartında null. */
  returnRequestId: number | null;
  /** Başlıktaki iade kodu; tamamlananlar kartında gösterilmediği için null. */
  returnCode: string | null;
  /** Başlık ve ilerleme çubuğunun durumu (tamamlananlar kartında 7). */
  statusCode: number | null;
  isCompleted: boolean;
  /** Beklemede ve henüz depoya ulaşmamış satır varsa talep iptal edilebilir. */
  cancellable: boolean;
  items: OrderDetailItem[];
};

function groupKeyOf(item: OrderDetailItem): string {
  return item.returnRequestId != null ? String(item.returnRequestId) : 'unknown';
}

/**
 * Web, gruplamayı `Object.values({ [return_request_id]: [...] })` ile yapar;
 * sayısal anahtarlar küçükten büyüğe sıralandığı için talepler eskiden yeniye
 * dizilir, id'siz kayıtlar en sona kalır. Aynı sıra burada açıkça uygulanır.
 */
function compareRequestIds(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

function isCompletedRequest(items: OrderDetailItem[]): boolean {
  return items[0]?.returnStatusCode === RETURN_COMPLETED_STATUS;
}

function toRequestGroup(items: OrderDetailItem[]): ReturnRequestGroup {
  const [first] = items;
  return {
    key: groupKeyOf(first),
    returnRequestId: first.returnRequestId ?? null,
    returnCode: first.returnCode?.trim() || null,
    // Web paritesi: kartın durumu talebin ilk satırından okunur.
    statusCode: first.returnStatusCode ?? null,
    isCompleted: false,
    cancellable: items.some(
      (item) => isPendingReturn(item.returnStatusCode) && !item.returnReceivedAt,
    ),
    items,
  };
}

/** İade edilen satırları talep kartlarına böler; tamamlananları tek kartta toplar. */
export function buildReturnRequestGroups(
  returnedItems: OrderDetailItem[] | null | undefined,
): ReturnRequestGroup[] {
  const byRequest = new Map<string, OrderDetailItem[]>();
  for (const item of returnedItems ?? []) {
    const key = groupKeyOf(item);
    const bucket = byRequest.get(key);
    if (bucket) bucket.push(item);
    else byRequest.set(key, [item]);
  }

  const requestItems = [...byRequest.values()].sort((a, b) =>
    compareRequestIds(a[0].returnRequestId ?? null, b[0].returnRequestId ?? null),
  );

  const openGroups = requestItems
    .filter((items) => !isCompletedRequest(items))
    .map(toRequestGroup);
  const completedItems = requestItems.filter(isCompletedRequest).flat();

  if (completedItems.length === 0) return openGroups;

  return [
    ...openGroups,
    {
      key: COMPLETED_RETURNS_GROUP_KEY,
      returnRequestId: null,
      returnCode: null,
      statusCode: RETURN_COMPLETED_STATUS,
      isCompleted: true,
      cancellable: false,
      items: completedItems,
    },
  ];
}

/** Kart başlığının altındaki özet: "2 ürün için iade ürünleriniz kargo ile yolda." */
export function describeReturnGroup(group: ReturnRequestGroup): string {
  const { description } = getReturnStatusDetails(group.statusCode);
  return `${group.items.length} ürün için ${description.toLocaleLowerCase('tr-TR')}`;
}
