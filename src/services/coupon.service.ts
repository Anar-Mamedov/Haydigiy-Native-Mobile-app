import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { CouponListResponseDto } from '@/features/coupon/api/coupon.dtos';
import { CouponDiscountType } from '@/types/checkout.types';

/** User coupons list (`GET /coupon/list`). */
export async function getCouponsDto(): Promise<CouponListResponseDto> {
  if (!appEnv.apiBaseUrl) return { coupons: [] };

  const response = await apiClient.get<CouponListResponseDto>('/coupon/list', {
    headers: { Accept: 'application/json' },
  });
  return response.data;
}

/** Request body for validating a coupon against the current order context. */
export interface CouponValidateRequestDto {
  coupon_code: string;
  platform_id: 'mobile';
  payment_method_id: string | number;
  shipping_price: number;
}

export interface CouponValidateResponseDto {
  valid: boolean;
  message: string;
  coupon_code?: string | null;
  discount_type?: CouponDiscountType;
  discount_value?: number;
  discount?: number;
  is_free_shipping?: boolean;
  is_combinable?: boolean;
}

/** Validates and applies a coupon for checkout (`POST /coupon/validate`). */
export async function validateCouponDto(
  data: Omit<CouponValidateRequestDto, 'platform_id'>,
): Promise<CouponValidateResponseDto> {
  const response = await apiClient.post<CouponValidateResponseDto>('/coupon/validate', {
    ...data,
    platform_id: 'mobile',
  });
  return response.data;
}

/** Removes the applied coupon from the active order (`POST /coupon/remove`). */
export async function removeCouponDto(): Promise<void> {
  await apiClient.post('/coupon/remove');
}
