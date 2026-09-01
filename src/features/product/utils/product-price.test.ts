import {
  formatDiscountRate,
  formatProductPrice,
  formatProductPriceAmount,
  resolveProductDiscount,
} from './product-price';

describe('resolveProductDiscount', () => {
  it('marks the product as discounted when the backend sends a rate and a higher first price', () => {
    expect(
      resolveProductDiscount({ discountRate: 20, firstPrice: 500, hasDiscount: true, price: 400 }),
    ).toEqual({ discountRate: 20, firstPrice: 500, isDiscounted: true });
  });

  it('stays on the regular layout when has_discount is not set', () => {
    expect(
      resolveProductDiscount({ discountRate: 20, firstPrice: 500, hasDiscount: false, price: 400 }),
    ).toEqual({ isDiscounted: false });

    expect(resolveProductDiscount({ price: 400 })).toEqual({ isDiscounted: false });
  });

  it('falls back to the regular layout when has_discount is true but no usable data came with it', () => {
    expect(resolveProductDiscount({ hasDiscount: true, price: 400 })).toEqual({
      isDiscounted: false,
    });
    expect(
      resolveProductDiscount({ discountRate: 0, firstPrice: 0, hasDiscount: true, price: 400 }),
    ).toEqual({ isDiscounted: false });
  });

  it('drops a first price that is not above the current price', () => {
    expect(
      resolveProductDiscount({ discountRate: 15, firstPrice: 400, hasDiscount: true, price: 400 }),
    ).toEqual({ discountRate: 15, firstPrice: undefined, isDiscounted: true });

    expect(
      resolveProductDiscount({ discountRate: 15, firstPrice: 300, hasDiscount: true, price: 400 }),
    ).toEqual({ discountRate: 15, firstPrice: undefined, isDiscounted: true });
  });

  it('keeps the strikethrough price when only the rate is missing', () => {
    expect(resolveProductDiscount({ firstPrice: 500, hasDiscount: true, price: 400 })).toEqual({
      discountRate: undefined,
      firstPrice: 500,
      isDiscounted: true,
    });
  });

  it('ignores non-finite values instead of rendering NaN', () => {
    expect(
      resolveProductDiscount({
        discountRate: Number.NaN,
        firstPrice: Number.POSITIVE_INFINITY,
        hasDiscount: true,
        price: 400,
      }),
    ).toEqual({ isDiscounted: false });
  });
});

describe('formatProductPriceAmount', () => {
  it('formats only the number so the currency can be typeset separately', () => {
    expect(formatProductPriceAmount(1234.5)).toBe('1.234,50');
    expect(formatProductPriceAmount(199.9)).toBe('199,90');
    expect(formatProductPriceAmount(0)).toBe('0,00');
  });

  it('returns an empty string for missing or invalid amounts', () => {
    expect(formatProductPriceAmount(null)).toBe('');
    expect(formatProductPriceAmount(undefined)).toBe('');
    expect(formatProductPriceAmount(Number.NaN)).toBe('');
  });
});

describe('formatProductPrice', () => {
  it('formats amounts with the Turkish separator and a TL suffix', () => {
    expect(formatProductPrice(1234.5)).toBe('1.234,50 TL');
    expect(formatProductPrice(0)).toBe('0,00 TL');
  });

  it('returns an empty string for missing or invalid amounts', () => {
    expect(formatProductPrice(null)).toBe('');
    expect(formatProductPrice(undefined)).toBe('');
    expect(formatProductPrice(Number.NaN)).toBe('');
  });
});

describe('formatDiscountRate', () => {
  it('renders the badge label', () => {
    expect(formatDiscountRate(20)).toBe('-%20');
    expect(formatDiscountRate(19.5)).toBe('-%19,5');
  });
});
