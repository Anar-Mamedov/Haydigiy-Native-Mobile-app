export type CouponDiscountType = 'percentage' | 'fixed' | 'free_shipping';

/** Domain model for a user discount coupon (`GET /coupon/list`). */
export type Coupon = {
  id: number;
  name: string;
  description: string | null;
  couponCode: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  minItemCount: number | null;
  startDate: string;
  endDate: string;
  isUserSpecific: boolean;
  isCombinable: boolean;
};
