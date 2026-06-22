import { mapCouponList } from './coupon.mapper';
import { CouponDto } from './coupon.dtos';

const baseDto: CouponDto = {
  id: 1,
  name: '  Hoş Geldin  ',
  description: '  10 TL indirim  ',
  coupon_code: 'WELCOME10',
  discount_type: 'fixed',
  discount_value: '10',
  min_order_amount: '100',
  max_discount_amount: null,
  min_item_count: '',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  is_user_specific: true,
  is_combinable: false,
};

describe('mapCouponList', () => {
  it('maps a flat array, coercing strings and trimming text', () => {
    const [coupon] = mapCouponList({ coupons: [baseDto] });

    expect(coupon).toMatchObject({
      id: 1,
      name: 'Hoş Geldin',
      description: '10 TL indirim',
      couponCode: 'WELCOME10',
      discountType: 'fixed',
      discountValue: 10,
      minOrderAmount: 100,
      maxDiscountAmount: null,
      minItemCount: null,
      isUserSpecific: true,
      isCombinable: false,
    });
  });

  it('flattens grouped buckets with user-specific coupons first', () => {
    const result = mapCouponList({
      coupons: {
        general: [{ ...baseDto, id: 2, coupon_code: 'GENERAL' }],
        user_specific: [{ ...baseDto, id: 1, coupon_code: 'MINE' }],
      },
    });

    expect(result.map((c) => c.couponCode)).toEqual(['MINE', 'GENERAL']);
  });

  it('returns an empty list for missing or malformed payloads', () => {
    expect(mapCouponList(undefined)).toEqual([]);
    expect(mapCouponList({})).toEqual([]);
    expect(mapCouponList({ coupons: {} })).toEqual([]);
  });
});
