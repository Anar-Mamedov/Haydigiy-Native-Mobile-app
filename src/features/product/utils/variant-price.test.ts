import { formatSizeSpecialPriceLabel, hasOwnVariantPrice, resolveSizeSpecialPrice, resolveVariantDiscountRate, resolveVariantPricing } from './variant-price';

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

describe('resolveVariantDiscountRate', () => {
  // Süet pijama: ürünün kendi indirimi yok.
  const pajama = { price: 339.99 };
  // 2 İp Bisiklet Yaka Sweat: 209,99 TL, %5 indirimle 199,99 TL.
  const discountedSweat = { firstPrice: 209.99, price: 199.99 };

  it('is how much cheaper the size is than an undiscounted product', () => {
    // 2XL 269,99 TL → %20,59 → %21.
    expect(resolveVariantDiscountRate(269.99, pajama)).toBe(21);
    expect(resolveVariantDiscountRate(349.99, { price: 439.99 })).toBe(20);
  });

  it('shows the whole discount from the first price when the product is already discounted', () => {
    // Regresyon: S bedeni 159,99 TL. Rozet indirimli fiyata göre %20 diyordu, fiyat kutusu
    // ise S seçilince first_price'a göre %24 gösteriyor.
    expect(resolveVariantDiscountRate(159.99, discountedSweat)).toBe(24);
    expect(
      resolveVariantPricing({ ...discountedSweat, discountRate: 5, hasDiscount: true }, { price: 159.99 })
        .discountRate,
    ).toBe(24);
  });

  it('matches the price box when a stale first price is still above the size price', () => {
    // first_price güncel fiyatın altında (ürün indirimli değil) ama beden fiyatının üstünde.
    const product = { firstPrice: 299.99, price: 399.99 };

    expect(resolveVariantDiscountRate(249.99, product)).toBe(
      resolveVariantPricing(product, { price: 249.99 }).discountRate,
    );
  });

  it('falls back to the product price when the first price is not above the size price', () => {
    // Fiyat kutusu bu bedende indirim göstermez; rozet bedenin ürüne göre ne kadar ucuz olduğunu söyler.
    expect(resolveVariantDiscountRate(349.99, { firstPrice: 299.99, price: 399.99 })).toBe(13);
  });

  it('is empty without an own cheaper price', () => {
    expect(resolveVariantDiscountRate(0, pajama)).toBeUndefined();
    expect(resolveVariantDiscountRate(undefined, pajama)).toBeUndefined();
    expect(resolveVariantDiscountRate(339.99, pajama)).toBeUndefined();
    expect(resolveVariantDiscountRate(359.99, pajama)).toBeUndefined();
    expect(resolveVariantDiscountRate(204.99, discountedSweat)).toBeUndefined();
  });

  it('is empty while the product price is unknown', () => {
    expect(resolveVariantDiscountRate(269.99, undefined)).toBeUndefined();
    expect(resolveVariantDiscountRate(269.99, null)).toBeUndefined();
    expect(resolveVariantDiscountRate(269.99, { price: 0 })).toBeUndefined();
  });

  it('drops a discount that rounds down to zero percent', () => {
    expect(resolveVariantDiscountRate(339.49, pajama)).toBeUndefined();
  });
});
