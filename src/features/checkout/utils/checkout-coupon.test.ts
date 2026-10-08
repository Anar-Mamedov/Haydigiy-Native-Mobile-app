import { AppliedCoupon } from '@/types/checkout.types';
import { Coupon } from '@/types/coupon.types';
import {
  getAppliedCouponDiscountText,
  getCouponBenefitLabel,
  getCouponExpiryLabel,
  getCouponTicketState,
  getCouponValueLabel,
  hasUnusedCouponBalance,
  isCouponActive,
  meetsCouponRequirements,
} from './checkout-coupon';

const NOW = new Date('2026-09-20T12:00:00Z').getTime();

function makeCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: 1,
    name: 'Yaz indirimi',
    description: null,
    couponCode: 'YAZ50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: null,
    maxDiscountAmount: null,
    minItemCount: null,
    startDate: '2026-09-01T00:00:00Z',
    endDate: '2026-10-31T23:59:59Z',
    isUserSpecific: false,
    isCombinable: false,
    ...overrides,
  };
}

const appliedYaz: AppliedCoupon = {
  code: 'yaz50',
  discountType: 'fixed',
  discountValue: 50,
  discount: 50,
  isFreeShipping: false,
};

describe('checkout coupon eligibility', () => {
  it('treats a coupon as active only between its start and end dates', () => {
    expect(isCouponActive(makeCoupon(), NOW)).toBe(true);
    expect(isCouponActive(makeCoupon({ startDate: '2026-09-21T00:00:00Z' }), NOW)).toBe(false);
    expect(isCouponActive(makeCoupon({ endDate: '2026-09-19T00:00:00Z' }), NOW)).toBe(false);
    expect(isCouponActive(makeCoupon({ endDate: 'geçersiz' }), NOW)).toBe(false);
  });

  it('checks the minimum order amount and item count against the cart', () => {
    const coupon = makeCoupon({ minOrderAmount: 250, minItemCount: 2 });

    expect(meetsCouponRequirements(coupon, { subtotal: 250, itemCount: 2 })).toBe(true);
    expect(meetsCouponRequirements(coupon, { subtotal: 249.99, itemCount: 2 })).toBe(false);
    expect(meetsCouponRequirements(coupon, { subtotal: 300, itemCount: 1 })).toBe(false);
    expect(meetsCouponRequirements(makeCoupon(), { subtotal: 0, itemCount: 0 })).toBe(true);
  });

  it('marks the applied coupon regardless of case and blocks unmet ones', () => {
    const cart = { subtotal: 100, itemCount: 1 };

    expect(getCouponTicketState(makeCoupon(), appliedYaz, cart, NOW)).toBe('applied');
    expect(getCouponTicketState(makeCoupon(), null, cart, NOW)).toBe('selectable');
    expect(getCouponTicketState(makeCoupon({ minOrderAmount: 500 }), null, cart, NOW)).toBe(
      'unavailable',
    );
    expect(
      getCouponTicketState(makeCoupon({ startDate: '2026-10-01T00:00:00Z' }), null, cart, NOW),
    ).toBe('unavailable');
  });
});

describe('checkout coupon labels', () => {
  it('shows the expiry label only in the last seven days', () => {
    expect(getCouponExpiryLabel('2026-09-20T18:00:00Z', NOW)).toBe('Son 1 gün');
    expect(getCouponExpiryLabel('2026-09-27T12:00:00Z', NOW)).toBe('Son 7 gün');
    expect(getCouponExpiryLabel('2026-09-28T12:00:00Z', NOW)).toBeNull();
    expect(getCouponExpiryLabel('2026-09-20T12:00:00Z', NOW)).toBe('Son gün');
    expect(getCouponExpiryLabel('2026-09-19T00:00:00Z', NOW)).toBeNull();
    expect(getCouponExpiryLabel('geçersiz', NOW)).toBeNull();
  });

  it('formats the ticket value and benefit per discount type', () => {
    expect(getCouponValueLabel(makeCoupon({ discountType: 'percentage', discountValue: 10 }))).toBe(
      '%10',
    );
    expect(getCouponValueLabel(makeCoupon())).toBe('₺50,00');
    expect(getCouponValueLabel(makeCoupon({ discountType: 'free_shipping' }))).toBe('Ücretsiz');
    expect(getCouponBenefitLabel(makeCoupon({ discountType: 'free_shipping' }))).toBe('KARGO');
    expect(getCouponBenefitLabel(makeCoupon())).toBe('İNDİRİM');
  });

  it('describes the applied coupon discount', () => {
    expect(getAppliedCouponDiscountText(appliedYaz)).toBe('₺50,00 İndirim');
    expect(
      getAppliedCouponDiscountText({ ...appliedYaz, discountType: 'percentage', discountValue: 15 }),
    ).toBe('%15 İndirim');
    expect(
      getAppliedCouponDiscountText({ ...appliedYaz, discountType: 'free_shipping', isFreeShipping: true }),
    ).toBe('Ücretsiz Kargo');
  });
});

describe('hasUnusedCouponBalance', () => {
  const fixed: AppliedCoupon = {
    code: 'HEDIYE500',
    discountType: 'fixed',
    discountValue: 500,
    discount: 300,
    isFreeShipping: false,
  };

  // Web: `discountType === 'fixed' && couponFaceValue > subtotal`.
  it('flags a fixed coupon whose face value is larger than the cart subtotal', () => {
    expect(hasUnusedCouponBalance(fixed, 300)).toBe(true);
    expect(hasUnusedCouponBalance(fixed, 499.99)).toBe(true);
  });

  it('stays quiet when the cart covers the coupon value', () => {
    expect(hasUnusedCouponBalance(fixed, 500)).toBe(false);
    expect(hasUnusedCouponBalance(fixed, 750)).toBe(false);
  });

  it('compares the face value, not the discount the backend applied', () => {
    // İndirim sepete kırpılmış olsa bile (300) yüz değeri (500) esas alınır.
    expect(hasUnusedCouponBalance({ ...fixed, discountValue: 500, discount: 300 }, 400)).toBe(true);
  });

  it('ignores percentage and free-shipping coupons and an empty coupon', () => {
    const percentage: AppliedCoupon = { ...fixed, discountType: 'percentage', discountValue: 90 };

    expect(hasUnusedCouponBalance(percentage, 50)).toBe(false);
    expect(hasUnusedCouponBalance({ ...fixed, discountType: 'free_shipping' }, 0)).toBe(false);
    expect(hasUnusedCouponBalance(null, 0)).toBe(false);
  });

  // Web paritesi: sipariş özetinden gelen kupon önceki değeri bilmiyorsa yüz değeri 0 olur.
  it('does not warn when the face value is unknown', () => {
    expect(hasUnusedCouponBalance({ ...fixed, discountValue: 0 }, 100)).toBe(false);
  });
});
