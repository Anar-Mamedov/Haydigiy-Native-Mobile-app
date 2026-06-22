import { CouponDiscountType } from '@/types/coupon.types';

export interface CouponDto {
  id: number;
  name?: string | null;
  description?: string | null;
  coupon_code: string;
  discount_type: CouponDiscountType;
  discount_value: number | string;
  min_order_amount?: number | string | null;
  max_discount_amount?: number | string | null;
  min_item_count?: number | string | null;
  start_date: string;
  end_date: string;
  is_user_specific?: boolean;
  is_combinable?: boolean;
}

interface CouponGroupsDto {
  user_specific?: CouponDto[];
  general?: CouponDto[];
}

/** The list endpoint returns either a flat array or grouped user-specific/general buckets. */
export interface CouponListResponseDto {
  coupons?: CouponDto[] | CouponGroupsDto;
}
