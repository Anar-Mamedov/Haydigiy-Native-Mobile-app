import { CouponDto, CouponListResponseDto } from './coupon.dtos';
import { Coupon } from '@/types/coupon.types';

function toNumber(value: number | string | undefined | null, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toNullableNumber(value: number | string | undefined | null): number | null {
  if (value == null || value === '') return null;
  const parsed = toNumber(value, NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapCoupon(dto: CouponDto): Coupon {
  return {
    id: dto.id,
    name: dto.name?.trim() || '',
    description: dto.description?.trim() || null,
    couponCode: dto.coupon_code,
    discountType: dto.discount_type,
    discountValue: toNumber(dto.discount_value),
    minOrderAmount: toNullableNumber(dto.min_order_amount),
    maxDiscountAmount: toNullableNumber(dto.max_discount_amount),
    minItemCount: toNullableNumber(dto.min_item_count),
    startDate: dto.start_date,
    endDate: dto.end_date,
    isUserSpecific: Boolean(dto.is_user_specific),
    isCombinable: Boolean(dto.is_combinable),
  };
}

/**
 * Flattens the list response (array or user-specific/general groups) into a single
 * ordered domain list, with user-specific coupons surfaced first.
 */
export function mapCouponList(response: CouponListResponseDto | null | undefined): Coupon[] {
  const coupons = response?.coupons;

  if (Array.isArray(coupons)) {
    return coupons.map(mapCoupon);
  }

  const userSpecific = Array.isArray(coupons?.user_specific) ? coupons.user_specific : [];
  const general = Array.isArray(coupons?.general) ? coupons.general : [];

  return [...userSpecific, ...general].map(mapCoupon);
}
