import {
  getDiscountPercent,
  isDisplayableDiscountPercent,
  MIN_DISPLAYED_DISCOUNT_PERCENT,
} from './discount-threshold';

describe('isDisplayableDiscountPercent', () => {
  it('uses the same 3% threshold as the web', () => {
    expect(MIN_DISPLAYED_DISCOUNT_PERCENT).toBe(3);
  });

  it('treats 3% or less as no discount', () => {
    expect(isDisplayableDiscountPercent(0)).toBe(false);
    expect(isDisplayableDiscountPercent(2)).toBe(false);
    expect(isDisplayableDiscountPercent(3)).toBe(false);
  });

  it('shows anything above 3% as a discount', () => {
    expect(isDisplayableDiscountPercent(3.5)).toBe(true);
    expect(isDisplayableDiscountPercent(4)).toBe(true);
    expect(isDisplayableDiscountPercent(20)).toBe(true);
  });

  it('rejects missing or malformed values', () => {
    expect(isDisplayableDiscountPercent(undefined)).toBe(false);
    expect(isDisplayableDiscountPercent(null)).toBe(false);
    expect(isDisplayableDiscountPercent(Number.NaN)).toBe(false);
    expect(isDisplayableDiscountPercent(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe('getDiscountPercent', () => {
  it('rounds the drop from the previous price to a whole percentage', () => {
    expect(getDiscountPercent(500, 400)).toBe(20);
    expect(getDiscountPercent(339.98, 299.98)).toBe(12);
  });

  it('is zero when there is no real drop', () => {
    expect(getDiscountPercent(400, 400)).toBe(0);
    expect(getDiscountPercent(300, 400)).toBe(0);
    expect(getDiscountPercent(0, 400)).toBe(0);
    expect(getDiscountPercent(Number.NaN, 400)).toBe(0);
  });
});
