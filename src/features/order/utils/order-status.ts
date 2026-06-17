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
