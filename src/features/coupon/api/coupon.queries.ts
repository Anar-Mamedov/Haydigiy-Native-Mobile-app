import { useQuery } from '@tanstack/react-query';
import { couponKeys } from './coupon.keys';
import { mapCouponList } from './coupon.mapper';
import { getCouponsDto } from '@/services/coupon.service';
import { Coupon } from '@/types/coupon.types';

/** Loads the authenticated user's discount coupons (`GET /coupon/list`). */
export function useCouponsQuery(enabled = true) {
  return useQuery<Coupon[]>({
    queryKey: couponKeys.lists(),
    enabled,
    staleTime: 60_000,
    queryFn: async () => mapCouponList(await getCouponsDto()),
  });
}
