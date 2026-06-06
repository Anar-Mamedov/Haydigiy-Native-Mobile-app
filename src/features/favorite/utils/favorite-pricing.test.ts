import { getFavoritePricing } from './favorite-pricing';
import { Product } from '@/types/product.types';

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: '1',
    title: 'Test',
    slug: 'test',
    price: 100,
    currency: 'TRY',
    description: '',
    imageUrl: '',
    brand: 'Brand',
    rating: 0,
    reviewCount: 0,
    sellerName: 'Brand',
    shippingLabel: '',
    category: 'Giyim',
    ...overrides,
  };
}

describe('getFavoritePricing', () => {
  it('returns no discount when base price is non-positive', () => {
    const result = getFavoritePricing(makeProduct({ price: 0 }));
    expect(result).toEqual({
      currentPrice: 0,
      originalPrice: 0,
      isDiscounted: false,
      discountAmount: 0,
    });
  });

  it('detects discount from a cheaper variant price', () => {
    const product = makeProduct({
      price: 100,
      variants: [
        { id: 'a', name: 'S', quantity: 1, price: 80, hasStock: true },
        { id: 'b', name: 'M', quantity: 1, price: 100, hasStock: true },
      ],
    });
    const result = getFavoritePricing(product);
    expect(result.isDiscounted).toBe(true);
    expect(result.currentPrice).toBe(80);
    expect(result.discountAmount).toBe(20);
  });

  it('detects discount from a "<n> TL" category tag below base price', () => {
    const product = makeProduct({ price: 100, categories: ['Elbise', '70 TL'] });
    const result = getFavoritePricing(product);
    expect(result.isDiscounted).toBe(true);
    expect(result.currentPrice).toBe(70);
    expect(result.discountAmount).toBe(30);
  });

  it('flags promo-hint categories as discounted without changing the price', () => {
    const product = makeProduct({ price: 100, categories: ['Büyük kampanya'] });
    const result = getFavoritePricing(product);
    expect(result.isDiscounted).toBe(true);
    expect(result.currentPrice).toBe(100);
    expect(result.discountAmount).toBe(0);
  });

  it('returns no discount for a plain full-price product', () => {
    const product = makeProduct({ price: 100, categories: ['Elbise'] });
    const result = getFavoritePricing(product);
    expect(result.isDiscounted).toBe(false);
    expect(result.currentPrice).toBe(100);
    expect(result.discountAmount).toBe(0);
  });
});
