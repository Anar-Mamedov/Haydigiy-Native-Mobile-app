import { calculateOrderTotals, getEffectiveCouponDiscount } from './order-totals';

const base = {
  subtotal: 1000,
  userDiscount: 0,
  campaignDiscount: 0,
  couponDiscount: 0,
  isFreeShippingCoupon: false,
  hasFreeShipping: false,
  cargoPrice: 50,
  serviceFee: 0,
  commissionRate: 0,
  installment: null,
};

describe('getEffectiveCouponDiscount', () => {
  it('returns the full discount for a non-free-shipping coupon', () => {
    expect(getEffectiveCouponDiscount(100, false, 50)).toBe(100);
  });

  it('subtracts the cargo price for a free-shipping coupon to avoid double counting', () => {
    expect(getEffectiveCouponDiscount(120, true, 50)).toBe(70);
  });

  it('never goes below zero', () => {
    expect(getEffectiveCouponDiscount(30, true, 50)).toBe(0);
    expect(getEffectiveCouponDiscount(-5, false, 0)).toBe(0);
  });
});

describe('calculateOrderTotals', () => {
  it('adds cargo to the subtotal for a plain single payment', () => {
    const totals = calculateOrderTotals(base);
    expect(totals.singlePaymentTotal).toBe(1050);
    expect(totals.finalTotal).toBe(1050);
    expect(totals.commission).toBe(0);
    expect(totals.installmentFee).toBe(0);
  });

  it('applies discounts in order: user → campaign → coupon', () => {
    const totals = calculateOrderTotals({
      ...base,
      userDiscount: 100,
      campaignDiscount: 50,
      couponDiscount: 50,
    });
    // 1000 - 100 - 50 - 50 = 800, + 50 cargo = 850
    expect(totals.singlePaymentTotal).toBe(850);
  });

  it('zeroes the cargo line when free shipping applies', () => {
    const totals = calculateOrderTotals({ ...base, hasFreeShipping: true });
    expect(totals.effectiveCargoPrice).toBe(0);
    expect(totals.singlePaymentTotal).toBe(1000);
  });

  it('adds commission and service fee to the final total but not the single-payment total', () => {
    const totals = calculateOrderTotals({ ...base, serviceFee: 10, commissionRate: 2 });
    // base after coupon = 1000, single = 1000 + 50 = 1050
    // withFees = 1000 + 10 + 50 = 1060, commission = 2% = 21.2, final = 1081.2
    expect(totals.singlePaymentTotal).toBe(1050);
    expect(totals.serviceFee).toBe(10);
    expect(totals.commission).toBeCloseTo(21.2);
    expect(totals.finalTotal).toBeCloseTo(1081.2);
  });

  it('uses installment count × per-month as the final total and derives the fee', () => {
    const totals = calculateOrderTotals({
      ...base,
      installment: { installment: 3, perMonth: 366.67 },
    });
    // base full payment = 1050, installment total = 1100.01
    expect(totals.finalTotal).toBeCloseTo(1100.01);
    expect(totals.installmentFee).toBeCloseTo(50.01);
    // single-payment total is unchanged by the installment selection
    expect(totals.singlePaymentTotal).toBe(1050);
  });
});
