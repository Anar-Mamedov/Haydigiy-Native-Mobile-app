import {
  formatDiscountLabel,
  getDiscountText,
  getRemainingDaysText,
} from './coupon-format';
import { Coupon } from '@/types/coupon.types';

const make = (overrides: Partial<Coupon>): Coupon => ({
  id: 1,
  name: '',
  description: null,
  couponCode: 'X',
  discountType: 'percentage',
  discountValue: 10,
  minOrderAmount: null,
  maxDiscountAmount: null,
  minItemCount: null,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  isUserSpecific: false,
  isCombinable: false,
  ...overrides,
});

describe('formatDiscountLabel', () => {
  it('renders a percentage value', () => {
    expect(formatDiscountLabel(make({ discountType: 'percentage', discountValue: 15 }))).toBe('%15');
  });

  it('renders a fixed amount in TL', () => {
    expect(formatDiscountLabel(make({ discountType: 'fixed', discountValue: 50 }))).toBe('50,00 TL');
  });

  it('renders free shipping label', () => {
    expect(formatDiscountLabel(make({ discountType: 'free_shipping' }))).toBe('Ücretsiz Kargo');
  });
});

describe('getDiscountText', () => {
  it('maps each discount type to its descriptor', () => {
    expect(getDiscountText('percentage')).toBe('Sepette indirim');
    expect(getDiscountText('fixed')).toBe('Sabit indirim');
    expect(getDiscountText('free_shipping')).toBe('Kargo bedava');
  });
});

describe('getRemainingDaysText', () => {
  it('reports an expired coupon', () => {
    expect(getRemainingDaysText('2000-01-01')).toBe('Süresi doldu');
  });

  it('handles an unparseable date', () => {
    expect(getRemainingDaysText('not-a-date')).toBe('Süre bilgisi yok');
  });
});
