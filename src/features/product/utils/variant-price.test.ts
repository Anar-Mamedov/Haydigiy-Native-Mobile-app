import {
  formatSizeSpecialPriceLabel,
  hasOwnVariantPrice,
  resolveSizeSpecialPrice,
  resolveVariantPricing,
} from './variant-price';

const discountedProduct = { discountRate: 13, firstPrice: 399.99, hasDiscount: true, price: 349.99 };

describe('hasOwnVariantPrice', () => {
  it('accepts only a positive finite price', () => {
    expect(hasOwnVariantPrice(299.99)).toBe(true);
    expect(hasOwnVariantPrice(0)).toBe(false);
    expect(hasOwnVariantPrice(null)).toBe(false);
    expect(hasOwnVariantPrice(undefined)).toBe(false);
    expect(hasOwnVariantPrice(Number.NaN)).toBe(false);
  });
});

describe('resolveVariantPricing', () => {
  it('keeps the product default pricing when no size is selected', () => {
    expect(resolveVariantPricing(discountedProduct, null)).toEqual(discountedProduct);
  });

  it('keeps the product default pricing when the selected size has no own price', () => {
    // Backend fiyatı olmayan bedeni `null` dönüyor; mapper bunu 0'a çeviriyor.
    expect(resolveVariantPricing(discountedProduct, { price: 0 })).toEqual(discountedProduct);
  });

  it('shows the size price and recalculates the discount from the first price', () => {
    expect(resolveVariantPricing(discountedProduct, { price: 299.99 })).toEqual({
      discountRate: 25,
      firstPrice: 399.99,
      hasDiscount: true,
      price: 299.99,
    });
  });

  it('drops the discount when the size price is not below the first price', () => {
    expect(resolveVariantPricing(discountedProduct, { price: 419.99 })).toEqual({
      discountRate: undefined,
      firstPrice: 399.99,
      hasDiscount: false,
      price: 419.99,
    });

    expect(resolveVariantPricing({ price: 349.99 }, { price: 299.99 })).toEqual({
      discountRate: undefined,
      firstPrice: undefined,
      hasDiscount: false,
      price: 299.99,
    });
  });
});

describe('resolveSizeSpecialPrice', () => {
  it('finds nothing while every size price is missing', () => {
    const sizes = [
      { name: 'S', hasStock: true },
      { name: 'M', hasStock: true, price: 0 },
    ];

    expect(resolveSizeSpecialPrice(sizes, 349.99)).toBeNull();
    expect(resolveSizeSpecialPrice(undefined, 349.99)).toBeNull();
  });

  it('returns the cheapest in-stock sizes priced below the product price', () => {
    const sizes = [
      { name: 'S', hasStock: true, price: 299.99 },
      { name: 'M', hasStock: true, price: 299.99 },
      { name: 'L', hasStock: false, price: 249.99 },
      { name: 'XL', hasStock: true, price: 349.99 },
      { name: '2XL', hasStock: true, price: 379.99 },
    ];

    expect(resolveSizeSpecialPrice(sizes, 349.99)).toEqual({ price: 299.99, sizeNames: ['S', 'M'] });
  });

  it('ignores special prices when the product price itself is unusable', () => {
    expect(resolveSizeSpecialPrice([{ name: 'S', hasStock: true, price: 299.99 }], 0)).toBeNull();
  });
});

describe('formatSizeSpecialPriceLabel', () => {
  it('uses Turkish size wording', () => {
    expect(formatSizeSpecialPriceLabel(['S'])).toBe('S bedenine özel');
    expect(formatSizeSpecialPriceLabel(['S', 'M'])).toBe('S ve M bedenlerine özel');
    expect(formatSizeSpecialPriceLabel(['S', 'M', 'L'])).toBe('S, M ve L bedenlerine özel');
  });
});
