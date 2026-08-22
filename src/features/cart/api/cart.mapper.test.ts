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
      itemType: 'product',
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

  // Insider `color` ürün parametresi sepet/satın alma eventlerini de beslemeli.
  it('carries the product colour when the backend returns it', () => {
    const withObject = mapCartItemDto(
      makeDto({
        product: { id: 42, name: 'Test Ürün', slug: 'test-urun', color: { name: ' Siyah ' } },
      }),
    );
    const withFlatField = mapCartItemDto(
      makeDto({
        product: { id: 42, name: 'Test Ürün', slug: 'test-urun', color_name: 'Mavi' },
      }),
    );

    expect(withObject.color).toBe('Siyah');
    expect(withFlatField.color).toBe('Mavi');
    expect(mapCartItemDto(makeDto()).color).toBeUndefined();
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

describe('mapCartItemDto (bundle)', () => {
  /** `/cart/list` bundle satırı: `variant_id`/`variant` gelmez, `bundle_group_id` gelir. */
  function makeBundleDto(): CartItemDto {
    return {
      variant_id: undefined as unknown as number,
      quantity: 1,
      old_price: null,
      price: '5000.00',
      current_price: '5000.00',
      stock_quantity: '',
      in_stock: true,
      item_type: 'bundle',
      bundle_product_id: 97045,
      bundle_group_id: '101703d9-b539-458e-ba74-8f334359e14f',
      product: { id: 97045, name: 'Deneme bundle', slug: 'deneme-bundle', media: { thumb: 'https://cdn/bundle.webp' } },
      bundle: {
        components: [
          {
            order_item_id: 11845555,
            product_name: 'Kemer Detaylı Yarım Kol Elbise Siyah - 52521.2204.',
            product_slug: 'kemer-detayli-yarim-kol-elbise-siyah-525212204',
            variant_name: 'L',
            quantity: 1,
            unit_price: 1250,
            image: { thumb: 'https://cdn/elbise.webp' },
          },
        ],
      },
    };
  }

  it('marks the line as a bundle and carries the group id used by the bundle endpoints', () => {
    const line = mapCartItemDto(makeBundleDto());

    expect(line.itemType).toBe('bundle');
    expect(line.bundleGroupId).toBe('101703d9-b539-458e-ba74-8f334359e14f');
    expect(line.bundleProductId).toBe('97045');
    // Bundle satırının variant_id'si yoktur; kimlik gruptan gelir.
    expect(line.variantId).toBeUndefined();
  });

  it('maps the package contents shown under the bundle line', () => {
    const line = mapCartItemDto(makeBundleDto());

    expect(line.bundleComponents).toHaveLength(1);
    expect(line.bundleComponents?.[0]).toMatchObject({
      orderItemId: 11845555,
      title: 'Kemer Detaylı Yarım Kol Elbise Siyah - 52521.2204.',
      variantName: 'L',
      quantity: 1,
      price: 1250,
      imageUrl: 'https://cdn/elbise.webp',
    });
  });

  it('falls back to the bundle product id when the product id is missing', () => {
    const dto = makeBundleDto();
    dto.product = null;
    const [line] = mapCartResponse([{ ...dto, product: { id: undefined, name: 'Deneme bundle', slug: 'deneme-bundle' } }]);
    expect(line.productId).toBe('97045');
  });
});
