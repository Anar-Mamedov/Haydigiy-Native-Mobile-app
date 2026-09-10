import {
  buildAnalyticsProduct,
  cartItemToAnalyticsProduct,
  productToAnalyticsProduct,
  trackingSnapshotToAnalyticsProduct,
} from './analytics-product.mapper';
import { CartLineItem } from '@/types/cart.types';
import { Product } from '@/types/product.types';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    brand: 'HaydiGiy',
    category: 'Giyim',
    currency: 'TRY',
    description: '',
    id: '101',
    imageUrl: 'https://cdn.example.com/a.jpg',
    price: 249.9,
    rating: 4.5,
    reviewCount: 10,
    sellerName: 'HaydiGiy',
    shippingLabel: '',
    slug: 'tisort-101',
    title: 'Basic Tişört',
    ...overrides,
  } as Product;
}

function buildCartLine(overrides: Partial<CartLineItem> = {}): CartLineItem {
  return {
    imageUrl: 'https://cdn.example.com/a.jpg',
    productId: '101',
    quantity: 2,
    sellerName: 'HaydiGiy',
    title: 'Basic Tişört',
    unitPrice: 199.9,
    ...overrides,
  };
}

describe('productToAnalyticsProduct', () => {
  it('reports the price the user currently sees, not the pre-discount price', () => {
    const product = buildProduct({ price: 199.9, originalPrice: 349.9 });

    expect(productToAnalyticsProduct(product).price).toBe(199.9);
  });

  it('uses the deepest category as the taxonomy leaf', () => {
    const product = buildProduct({ categories: ['Kadın', 'Üst Giyim', 'Tişört'] });

    expect(productToAnalyticsProduct(product).category).toBe('Tişört');
  });

  it('falls back to the flat category when no taxonomy is present', () => {
    expect(productToAnalyticsProduct(buildProduct()).category).toBe('Giyim');
  });

  it('omits a blank brand instead of reporting an empty string', () => {
    expect(productToAnalyticsProduct(buildProduct({ brand: '  ' })).brand).toBeUndefined();
  });

  it('carries the quantity and variant supplied by the caller', () => {
    expect(
      productToAnalyticsProduct(buildProduct(), { quantity: 3, variantId: '9001' }),
    ).toMatchObject({ quantity: 3, variantId: '9001' });
  });
});

describe('cartItemToAnalyticsProduct', () => {
  it('maps the cart line onto the analytics shape', () => {
    expect(cartItemToAnalyticsProduct(buildCartLine({ variantId: '9001' }))).toEqual({
      id: '101',
      name: 'Basic Tişört',
      price: 199.9,
      currency: 'TRY',
      quantity: 2,
      variantId: '9001',
    });
  });
});

describe('trackingSnapshotToAnalyticsProduct', () => {
  it('prefers the sale price, because that is what the customer pays', () => {
    const result = trackingSnapshotToAnalyticsProduct({
      id: '101',
      name: 'Basic Tişört',
      price: 349.9,
      salePrice: 199.9,
      currency: 'TRY',
    });

    expect(result.price).toBe(199.9);
  });

  it('keeps the list price when the item is not discounted', () => {
    const result = trackingSnapshotToAnalyticsProduct({
      id: '101',
      name: 'Basic Tişört',
      price: 349.9,
      currency: 'TRY',
    });

    expect(result.price).toBe(349.9);
  });

  it('treats a zero sale price as a real price rather than falling back', () => {
    const result = trackingSnapshotToAnalyticsProduct({
      id: '101',
      name: 'Hediye',
      price: 349.9,
      salePrice: 0,
      currency: 'TRY',
    });

    expect(result.price).toBe(0);
  });

  it('takes the taxonomy leaf as the category', () => {
    const result = trackingSnapshotToAnalyticsProduct({
      id: '101',
      name: 'Basic Tişört',
      price: 349.9,
      currency: 'TRY',
      taxonomy: ['Kadın', 'Tişört'],
    });

    expect(result.category).toBe('Tişört');
  });

  it('defaults the currency when the snapshot carries none', () => {
    const result = trackingSnapshotToAnalyticsProduct({
      id: '101',
      name: 'Basic Tişört',
      price: 349.9,
      currency: '',
    });

    expect(result.currency).toBe('TRY');
  });
});

describe('buildAnalyticsProduct', () => {
  it('defaults the currency for partial call sites', () => {
    expect(buildAnalyticsProduct({ id: '1', name: 'X', price: 10 }).currency).toBe('TRY');
  });
});
