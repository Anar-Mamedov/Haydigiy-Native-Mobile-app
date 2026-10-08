import { AppliedCoupon } from '@/types/checkout.types';
import { Coupon } from '@/types/coupon.types';
import { formatCurrency } from '@/utils/format-currency';

const DAY_MS = 86_400_000;
/** Bitişine en fazla bu kadar gün kalan kuponda "Son N gün" etiketi gösterilir (web paritesi). */
const EXPIRY_LABEL_MAX_DAYS = 7;

/** Kupon şartlarının karşılaştırıldığı sepet değerleri. */
export type CouponCartSnapshot = {
  subtotal: number;
  itemCount: number;
};

/** Kupon kartının görünümü: uygulanmış, seçilebilir ya da şartı sağlanmamış. */
export type CouponTicketState = 'applied' | 'selectable' | 'unavailable';

export function isCouponActive(coupon: Coupon, now: number = Date.now()): boolean {
  const startsAt = new Date(coupon.startDate).getTime();
  const endsAt = new Date(coupon.endDate).getTime();
  return Number.isFinite(startsAt) && Number.isFinite(endsAt) && startsAt <= now && now <= endsAt;
}

export function meetsCouponRequirements(coupon: Coupon, cart: CouponCartSnapshot): boolean {
  const meetsMinOrder = coupon.minOrderAmount == null || cart.subtotal >= coupon.minOrderAmount;
  const meetsMinItems = coupon.minItemCount == null || cart.itemCount >= coupon.minItemCount;
  return meetsMinOrder && meetsMinItems;
}

export function isSameCouponCode(first: string, second: string): boolean {
  return first.toLocaleLowerCase('tr-TR') === second.toLocaleLowerCase('tr-TR');
}

export function getCouponTicketState(
  coupon: Coupon,
  appliedCoupon: AppliedCoupon | null,
  cart: CouponCartSnapshot,
  now: number = Date.now(),
): CouponTicketState {
  if (appliedCoupon && isSameCouponCode(appliedCoupon.code, coupon.couponCode)) return 'applied';
  return isCouponActive(coupon, now) && meetsCouponRequirements(coupon, cart)
    ? 'selectable'
    : 'unavailable';
}

/** Bitişe 7 gün ya da daha az kaldıysa "Son gün" / "Son N gün"; aksi halde etiket yok. */
export function getCouponExpiryLabel(endDate: string, now: number = Date.now()): string | null {
  const remainingDays = Math.ceil((new Date(endDate).getTime() - now) / DAY_MS);
  if (!Number.isFinite(remainingDays) || remainingDays < 0 || remainingDays > EXPIRY_LABEL_MAX_DAYS) {
    return null;
  }
  return remainingDays === 0 ? 'Son gün' : `Son ${remainingDays} gün`;
}

/** Kupon kartının renkli bölümündeki büyük değer ("%10", "₺50,00", "Ücretsiz"). */
export function getCouponValueLabel(coupon: Coupon): string {
  if (coupon.discountType === 'percentage') return `%${coupon.discountValue}`;
  if (coupon.discountType === 'fixed') return formatCurrency(coupon.discountValue);
  return 'Ücretsiz';
}

/** Değerin altındaki kısa açıklama. */
export function getCouponBenefitLabel(coupon: Coupon): string {
  return coupon.discountType === 'free_shipping' ? 'KARGO' : 'İNDİRİM';
}

/** Uygulanmış kuponun indirim türü ("%10 İndirim", "₺50,00 İndirim", "Ücretsiz Kargo"). */
export function getAppliedCouponDiscountText(coupon: AppliedCoupon): string {
  if (coupon.discountType === 'percentage') return `%${coupon.discountValue} İndirim`;
  if (coupon.discountType === 'fixed') return `${formatCurrency(coupon.discountValue)} İndirim`;
  return 'Ücretsiz Kargo';
}

/** Web ödeme özetindeki uyarının birebir metni. */
export const UNUSED_COUPON_BALANCE_MESSAGE =
  'Kupon tutarının sepet toplamını aşan kısmı kullanılamaz. Kalan tutar ise kullanılamayacaktır.';

/**
 * Sabit tutarlı kuponun yüz değeri sepet ara toplamını aşıyorsa true (web
 * `hasUnusedCouponBalance`). Yüzde ve ücretsiz kargo kuponlarında artan tutar olmaz.
 */
export function hasUnusedCouponBalance(coupon: AppliedCoupon | null, subtotal: number): boolean {
  if (coupon?.discountType !== 'fixed') return false;
  const faceValue = Number(coupon.discountValue ?? coupon.discount ?? 0);
  return faceValue > subtotal;
}
