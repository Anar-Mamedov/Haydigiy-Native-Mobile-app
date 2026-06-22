import { Coupon, CouponDiscountType } from '@/types/coupon.types';

/** Formats a numeric amount as Turkish Lira with two fraction digits. */
export function formatCouponPrice(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** The big highlighted value on the ticket stub (e.g. "%10", "50,00 TL", "Ücretsiz Kargo"). */
export function formatDiscountLabel(coupon: Coupon): string {
  if (coupon.discountType === 'percentage') return `%${coupon.discountValue}`;
  if (coupon.discountType === 'fixed') return `${formatCouponPrice(coupon.discountValue)} TL`;
  return 'Ücretsiz Kargo';
}

/** Short descriptor under the discount value. */
export function getDiscountText(discountType: CouponDiscountType): string {
  if (discountType === 'percentage') return 'Sepette indirim';
  if (discountType === 'fixed') return 'Sabit indirim';
  return 'Kargo bedava';
}

/** Human "days left" copy derived from the coupon end date. */
export function getRemainingDaysText(dateValue: string): string {
  const endDate = new Date(dateValue);
  if (Number.isNaN(endDate.getTime())) return 'Süre bilgisi yok';

  const now = new Date();
  const diffInDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return 'Süresi doldu';
  if (diffInDays === 0) return 'Bugün son gün';
  return `${diffInDays} gün kaldı`;
}

/** Localized short date, or "-" when unparseable. */
export function formatCouponDate(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('tr-TR');
}
