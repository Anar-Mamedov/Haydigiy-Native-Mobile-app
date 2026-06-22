import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { CouponListResponseDto } from '@/features/coupon/api/coupon.dtos';

/** User coupons list (`GET /coupon/list`). */
export async function getCouponsDto(): Promise<CouponListResponseDto> {
  if (!appEnv.apiBaseUrl) return { coupons: [] };

  const response = await apiClient.get<CouponListResponseDto>('/coupon/list', {
    headers: { Accept: 'application/json' },
  });
  return response.data;
}
