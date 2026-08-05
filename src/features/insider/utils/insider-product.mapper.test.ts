import {
  cartItemToInsiderInput,
  DEFAULT_INSIDER_TAXONOMY,
  isValidInsiderProductInput,
  productToInsiderInput,
} from './insider-product.mapper';
import { CartLineItem } from '@/types/cart.types';
import { Product } from '@/types/product.types';

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    brand: 'HaydiGiy',
    category: 'Elbise',
    currency: 'TRY',
    description: '',
    id: '42',
    imageUrl: 'https://cdn.example.com/42.jpg',
    price: 199.9,
    rating: 4.5,
    reviewCount: 12,
    sellerName: 'HaydiGiy',
    shippingLabel: '',
    slug: 'mavi-elbise',
    title: 'Mavi Elbise',
    ...overrides,
  };
}

function createCartItem(overrides: Partial<CartLineItem> = {}): CartLineItem {
  return {
    imageUrl: 'https://cdn.example.com/42.jpg',
    productId: '42',
    quantity: 2,
    sellerName: 'HaydiGiy',
    title: 'Mavi Elbise',
    unitPrice: 149.9,
    size: 'M',
    slug: 'mavi-elbise',
    ...overrides,
  };
}

describe('productToInsiderInput', () => {
  it('maps the core Insider product fields from the domain product', () => {
    const input = productToInsiderInput(createProduct(), { size: 'L', quantity: 1 });

    expect(input).toMatchObject({
      id: '42',
      name: 'Mavi Elbise',
      taxonomy: ['Elbise'],
      imageUrl: 'https://cdn.example.com/42.jpg',
      price: 199.9,
      currency: 'TRY',
      brand: 'HaydiGiy',
      size: 'L',
      quantity: 1,
      productUrl: 'https://haydigiy.com/product/mavi-elbise',
    });
    expect(input.salePrice).toBeUndefined();
  });

  it('prefers the full category path when available', () => {
    const input = productToInsiderInput(
      createProduct({ categories: ['Kadın', 'Elbise', 'Mavi Elbise'] }),
    );

    expect(input.taxonomy).toEqual(['Kadın', 'Elbise', 'Mavi Elbise']);
  });

  it('falls back to the default taxonomy when no category exists', () => {
    const input = productToInsiderInput(createProduct({ category: '', categories: [] }));

    expect(input.taxonomy).toEqual(DEFAULT_INSIDER_TAXONOMY);
  });

  it('splits discounted pricing into price and salePrice', () => {
    const input = productToInsiderInput(createProduct({ price: 149.9, originalPrice: 199.9 }));

    expect(input.price).toBe(199.9);
    expect(input.salePrice).toBe(149.9);
  });
});

describe('cartItemToInsiderInput', () => {
  it('maps a cart line to an Insider product snapshot', () => {
    const input = cartItemToInsiderInput(createCartItem());

    expect(input).toMatchObject({
      id: '42',
      name: 'Mavi Elbise',
      taxonomy: DEFAULT_INSIDER_TAXONOMY,
      price: 149.9,
      currency: 'TRY',
      size: 'M',
      quantity: 2,
      productUrl: 'https://haydigiy.com/product/mavi-elbise',
    });
  });

  it('keeps the struck-through original price as the list price', () => {
    const input = cartItemToInsiderInput(createCartItem({ unitPrice: 99.9, originalPrice: 149.9 }));

    expect(input.price).toBe(149.9);
    expect(input.salePrice).toBe(99.9);
  });
});

describe('isValidInsiderProductInput', () => {
  it('accepts a complete snapshot', () => {
    expect(isValidInsiderProductInput(productToInsiderInput(createProduct()))).toBe(true);
  });

  it.each([
    ['empty id', { id: ' ' }],
    ['empty name', { title: '' }],
    ['zero price', { price: 0 }],
  ] as const)('rejects a snapshot with %s', (_label, overrides) => {
    expect(
      isValidInsiderProductInput(productToInsiderInput(createProduct(overrides as Partial<Product>))),
    ).toBe(false);
  });
});
