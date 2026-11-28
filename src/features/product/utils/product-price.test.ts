import {
  formatDiscountRate,
  formatProductPrice,
  formatProductPriceAmount,
  resolveProductDiscount,
} from './product-price';

describe('resolveProductDiscount', () => {
  it('marks the product as discounted when the backend sends a rate and a higher first price', () => {
    expect(
      resolveProductDiscount({ discountRate: 20, firstPrice: 500, hasDiscount: true, price: 400 }, 'card'),
    ).toEqual({ discountRate: 20, firstPrice: 500, isDiscounted: true });
  });

  it('stays on the regular layout when has_discount is not set', () => {
    expect(
      resolveProductDiscount({ discountRate: 20, firstPrice: 500, hasDiscount: false, price: 400 }, 'detail'),
    ).toEqual({ isDiscounted: false });

    expect(resolveProductDiscount({ price: 400 }, 'detail')).toEqual({ isDiscounted: false });
  });

  it('falls back to the regular layout when has_discount is true but no usable data came with it', () => {
    expect(resolveProductDiscount({ hasDiscount: true, price: 400 }, 'detail')).toEqual({
      isDiscounted: false,
    });
    expect(
      resolveProductDiscount({ discountRate: 0, firstPrice: 0, hasDiscount: true, price: 400 }, 'detail'),
    ).toEqual({ isDiscounted: false });
  });

  it('drops a first price that is not above the current price', () => {
    expect(
      resolveProductDiscount({ discountRate: 15, firstPrice: 400, hasDiscount: true, price: 400 }, 'card'),
    ).toEqual({ discountRate: 15, firstPrice: undefined, isDiscounted: true });

    expect(
      resolveProductDiscount({ discountRate: 15, firstPrice: 300, hasDiscount: true, price: 400 }, 'card'),
    ).toEqual({ discountRate: 15, firstPrice: undefined, isDiscounted: true });
  });

  it('keeps the strikethrough price when only the rate is missing', () => {
    expect(resolveProductDiscount({ firstPrice: 500, hasDiscount: true, price: 400 }, 'card')).toEqual({
      discountRate: undefined,
      firstPrice: 500,
      isDiscounted: true,
    });
  });

  it.each([1, 2, 3])('does not treat a %i%% rate as a discount on a listing card, like the web', (discountRate) => {
    expect(
      resolveProductDiscount({ discountRate, firstPrice: 412, hasDiscount: true, price: 400 }, 'card'),
    ).toEqual({ isDiscounted: false });
  });

  // HMA-73 (web fd30ed0a6): ürün detayında %3 ve altındaki indirim de indirim düzeniyle çizilir.
  it.each([1, 2, 3])('shows a %i%% rate as a discount on the product detail', (discountRate) => {
    expect(
      resolveProductDiscount({ discountRate, firstPrice: 412, hasDiscount: true, price: 400 }, 'detail'),
    ).toEqual({ discountRate, firstPrice: 412, isDiscounted: true });
  });

  it('shows a rate just above the 3% threshold on a listing card', () => {
    expect(
      resolveProductDiscount({ discountRate: 4, firstPrice: 417, hasDiscount: true, price: 400 }, 'card'),
    ).toEqual({ discountRate: 4, firstPrice: 417, isDiscounted: true });
  });

  it('applies the surface threshold to the first price when the rate is missing', () => {
    // 410 → 400 = %2,4 → %2: kartta indirim sayılmaz, detayda sayılır.
    expect(resolveProductDiscount({ firstPrice: 410, hasDiscount: true, price: 400 }, 'card')).toEqual({
      isDiscounted: false,
    });
    expect(resolveProductDiscount({ firstPrice: 410, hasDiscount: true, price: 400 }, 'detail')).toEqual({
      discountRate: undefined,
      firstPrice: 410,
      isDiscounted: true,
    });
  });

  it('ignores non-finite values instead of rendering NaN', () => {
    expect(
      resolveProductDiscount(
        {
          discountRate: Number.NaN,
          firstPrice: Number.POSITIVE_INFINITY,
          hasDiscount: true,
          price: 400,
        },
        'detail',
      ),
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
