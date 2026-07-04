import { mapCartItemDto, mapCartResponse } from './cart.mapper';
import { CartItemDto } from './cart.dtos';

function makeDto(overrides: Partial<CartItemDto> = {}): CartItemDto {
  return {
    variant_id: 555,
    quantity: 2,
    old_price: '120.00',
    price: '100.00',
    current_price: '100.00',
    stock_quantity: '3',
    in_stock: true,
    product: {
      id: 42,
      name: 'Test Ürün',
      slug: 'test-urun',
      seller_name: 'Test Satıcı',
      media: { thumb: 'https://example.com/t.jpg' },
    },
    variant: { name: 'M', size: { id: 1, name: 'M' } },
    ...overrides,
  };
}

describe('mapCartItemDto', () => {
  it('maps a backend cart line into the domain model keyed by variant id', () => {
    expect(mapCartItemDto(makeDto())).toEqual({
      variantId: '555',
      productId: '42',
      title: 'Test Ürün',
      slug: 'test-urun',
      imageUrl: 'https://example.com/t.jpg',
      sellerName: 'Test Satıcı',
      quantity: 2,
      unitPrice: 100,
      originalPrice: 120,
      stock: 3,
      size: 'M',
    });
  });

  it('omits the original price when it is not higher than the current price', () => {
    const item = mapCartItemDto(makeDto({ old_price: '90.00', current_price: '100.00' }));
    expect(item.originalPrice).toBeUndefined();
  });

  // Regression: the backend charges `discounted_price > 0 ? discounted_price : price`
  // at /order/token; pricing lines from the undiscounted product price made checkout
  // totals drift and the place-order total guard rejected the payment.
  it('prefers the current discounted price so totals match the charged amount', () => {
    const item = mapCartItemDto(
      makeDto({ current_price: '100.00', current_discounted_price: '80.00' }),
    );
    expect(item.unitPrice).toBe(80);
    expect(item.originalPrice).toBe(120);
  });

  it('ignores a non-positive discounted price like the backend charge guard does', () => {
    const item = mapCartItemDto(
      makeDto({ current_price: '100.00', current_discounted_price: '0.00' }),
    );
    expect(item.unitPrice).toBe(100);
  });

  it('falls back to the cart row price when the current prices are missing', () => {
    const item = mapCartItemDto(
      makeDto({ current_price: '', current_discounted_price: null, price: '75.00' }),
    );
    expect(item.unitPrice).toBe(75);
  });

  it('falls back to the variant id when the product id is missing', () => {
    const item = mapCartItemDto(makeDto({ product: { name: 'X', slug: 'x' } }));
    expect(item.productId).toBe('555');
  });
});

describe('mapCartResponse', () => {
  it('drops lines whose product is null so the UI never renders broken items', () => {
    const items = mapCartResponse([
      makeDto(),
      makeDto({ variant_id: 999, product: null }),
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.variantId).toBe('555');
  });
});
