import { BadgeCheck, CircleCheck, CircleX, Clock, Truck } from '@tamagui/lucide-icons-2';

export const PENDING_PAYMENT_STATUS_TEXT =
  'Ödeme durumu beklemede. Bankadan ödeme bilgilerinin gelmesi bekleniyor. (Bu işlem 10 dakika kadar sürebilir.)';

/** "Taslak" orders are awaiting payment confirmation; show the explanatory text. */
export function getOrderStatusText(status: string): string {
  if (status?.trim() === 'Taslak') {
    return PENDING_PAYMENT_STATUS_TEXT;
  }
  return status;
}

/**
 * Normalizes the various date shapes the API returns to a readable label:
 * "17 Haziran 2026 - 12:00" → "17 Haziran 2026"; ISO "2026-06-10T..." → "2026-06-10".
 */
export function formatOrderDate(value: string): string {
  if (!value) return '-';
  if (value.includes(' - ')) return value.split(' - ')[0];
  if (value.includes('T')) return value.split('T')[0];
  return value;
}

/** Formats a numeric amount as "1234.56 TL", matching the web order detail. */
export function formatOrderPrice(value: number | string | null | undefined): string {
  const num = typeof value === 'number' ? value : Number(value);
  return `${Number.isFinite(num) ? num.toFixed(2) : '0.00'} TL`;
}

/** Ordered timeline steps shown on the order detail screen. */
export const ORDER_TIMELINE_STEPS = [
  'Sipariş Alındı',
  'Onaylandı',
  'Hazırlanıyor',
  'Kargoya Verildi',
  'Teslim Edildi',
];

/** Active step index for a status id (−1 when none / cancelled). */
export function getOrderTimelineActiveIndex(statusId: number): number {
  if ([1, 2, 14, 17, 19].includes(statusId)) return 0;
  if ([3, 16].includes(statusId)) return 1;
  if ([5, 6, 12].includes(statusId)) return 2;
  if ([7, 15, 9, 13, 18].includes(statusId)) return 3;
  if ([8, 10, 11].includes(statusId)) return 4;
  return -1;
}

const CANCELLABLE_STATUS_IDS = new Set([1, 2, 3, 5, 6, 14, 16]);
const CANCELLABLE_STATUS_LABELS = new Set([
  'sipariş alındı',
  'onay bekliyor',
  'onaylandı',
  'hazırlanıyor',
  'paketleniyor',
  'ödeme kaydı alınamadı',
  'kontrol',
]);

/** Whether an order may still be cancelled (before it ships), matching the web rules. */
export function isOrderCancellableStatus(status: string, statusId: number): boolean {
  if (CANCELLABLE_STATUS_IDS.has(statusId)) return true;
  const normalized = status?.trim().toLocaleLowerCase('tr-TR');
  return normalized ? CANCELLABLE_STATUS_LABELS.has(normalized) : false;
}

/** Maps an order status to its lucide icon, matching the web order list. */
export function getOrderStatusIcon(status: string) {
  switch (status) {
    case 'Kargoya Verildi':
      return Truck;
    case 'Teslim Edildi':
    case 'Sipariş tamamlandı':
      return CircleCheck;
    case 'Sipariş Alındı':
      return Clock;
    case 'Onaylandı':
      return BadgeCheck;
    case 'İptal Edildi':
      return CircleX;
    default:
      return CircleCheck;
  }
}
