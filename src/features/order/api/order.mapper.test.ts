import { mapOrderDto, mapOrdersResponse, mapReturnRequestDto } from './order.mapper';
import { OrderDto } from './order.dtos';

function baseOrder(overrides: Partial<OrderDto> = {}): OrderDto {
  return {
    id: 1,
    order_no: 'HG-100',
    status: 'Kargoya Verildi',
    status_color: '#f27a1a',
    total_price: '149,99 TL',
    created_at: '17 Haziran 2026 - 12:00',
    shipment_count: 1,
    product_count: 2,
    receiver: 'Anar Mamedov',
    products: [
      { name: 'Ürün A', variant_name: 'M', image: 'a.jpg', slug: 'urun-a' },
      { name: 'Ürün B', variant_name: 'L', image: null, slug: 'urun-b' },
    ],
    ...overrides,
  };
}

describe('mapOrderDto', () => {
  it('maps an order and tags normal/returned/cancelled products', () => {
    const order = mapOrderDto(
      baseOrder({
        returned_items: [{ name: 'İade Ürün', quantity: 1, slug: 'iade' }],
        cancelled_items: [{ name: 'İptal Ürün', quantity: 1, slug: 'iptal' }],
      }),
    );

    expect(order.orderNo).toBe('HG-100');
    expect(order.products).toHaveLength(4);
    expect(order.products.map((p) => p.kind)).toEqual([
      'normal',
      'normal',
      'returned',
      'cancelled',
    ]);
  });

  it('normalizes a keyed-object products map into an array', () => {
    const order = mapOrderDto(
      baseOrder({ products: { 0: { name: 'X', slug: 'x' }, 1: { name: 'Y', slug: 'y' } } }),
    );
    expect(order.products).toHaveLength(2);
    expect(order.products[0]?.name).toBe('X');
  });

  it('flags a fully cancelled order (no active or returned items)', () => {
    const order = mapOrderDto(
      baseOrder({
        product_count: 0,
        products: [],
        cancelled_items: [{ name: 'İptal', quantity: 2 }],
      }),
    );
    expect(order.isFullyCancelled).toBe(true);
  });

  it('falls back to order_number then "-" for the order no', () => {
    expect(mapOrderDto(baseOrder({ order_no: undefined, order_number: 'ON-5' })).orderNo).toBe('ON-5');
    expect(
      mapOrderDto(baseOrder({ order_no: undefined, order_number: undefined })).orderNo,
    ).toBe('-');
  });
});

describe('mapOrdersResponse', () => {
  it('maps data and meta', () => {
    const page = mapOrdersResponse({
      data: [baseOrder()],
      meta: { current_page: 2, last_page: 5, per_page: 10, total: 42 },
    });
    expect(page.orders).toHaveLength(1);
    expect(page.meta).toEqual({ currentPage: 2, lastPage: 5, perPage: 10, total: 42 });
  });
});

describe('mapReturnRequestDto', () => {
  it('builds an order card from a return request with reasons and a unique row id', () => {
    const order = mapReturnRequestDto({
      id: 9,
      return_code: 'R-1',
      order: { id: 3, order_no: 'HG-3', total_price: '50 TL', created_at: '2026-06-10' },
      items: [
        { quantity: 1, reason: { name: 'Beden büyük geldi' }, thumbnail_path: 'iade.jpg' },
        { quantity: 2, reason: { name: 'Ürünü beğenmedim' } },
      ],
    });
    expect(order.id).toBe(3);
    expect(order.orderNo).toBe('HG-3');
    expect(order.status).toBe('İade Talebi Oluşturuldu');
    expect(order.totalPrice).toBe('50 TL');
    expect(order.productCount).toBe(3);
    // One thumbnail per returned line; image from the return photo or null.
    expect(order.products).toHaveLength(2);
    expect(order.products.every((p) => p.kind === 'returned')).toBe(true);
    expect(order.products[0]?.image).toBe('iade.jpg');
    expect(order.products[1]?.image).toBeNull();
    // Return-request id is the unique row id; reasons are surfaced for the card.
    expect(order.returnRequestId).toBe(9);
    expect(order.returnReasons).toEqual(['Beden büyük geldi', 'Ürünü beğenmedim']);
  });

  it('deduplicates repeated return reasons', () => {
    const order = mapReturnRequestDto({
      id: 10,
      order: { id: 4 },
      items: [
        { quantity: 1, reason: { name: 'Beden büyük geldi' } },
        { quantity: 1, reason: { name: 'Beden büyük geldi' } },
      ],
    });
    expect(order.returnReasons).toEqual(['Beden büyük geldi']);
  });
});

describe('mapOrderDto (bundle)', () => {
  /** `/orders` listesindeki paket satırı: tek ürün olarak döner, içeriği `components` altındadır. */
  const bundleProduct = {
    name: 'Deneme bundle',
    variant_name: '4 ürün',
    image: 'https://cdn/deneme-bundle.webp',
    slug: 'deneme-bundle',
    item_type: 'bundle' as const,
    bundle_product_id: 97045,
    bundle_group_id: '101703d9-b539-458e-ba74-8f334359e14f',
    components: [
      {
        order_item_id: 11845555,
        product_name: 'Kemer Detaylı Yarım Kol Elbise Siyah - 52521.2204.',
        product_slug: 'kemer-detayli-yarim-kol-elbise-siyah-525212204',
        variant_name: 'L',
        quantity: 1,
        unit_price: 1250,
        image: { id: 730230, thumb: 'https://cdn/elbise.webp' },
      },
      {
        order_item_id: 11845557,
        product_name: 'Raşel Kumaş İkili Takım Açıkhaki - 75247.801.',
        product_slug: 'rasel-kumas-ikili-takim-acikhaki-75247801-96763',
        variant_name: 'L',
        quantity: 1,
        unit_price: 1250,
        image: { id: 759350, thumb: 'https://cdn/rasel.webp' },
      },
    ],
  };

  const normalProduct = {
    name: 'Uzun Kollu Cepli Gömlek Siyah - 7841.1437.',
    variant_name: 'STANDART',
    image: 'https://cdn/gomlek.webp',
    slug: 'uzun-kollu-cepli-gomlek-siyah-78411437-95236',
    item_type: 'product' as const,
    bundle_product_id: null,
    bundle_group_id: null,
    components: [],
  };

  function makeOrder() {
    return mapOrderDto({
      id: 1387277,
      order_no: 'HG2208261387277',
      status: 'Teslim Edildi',
      total_price: '5.429,97 TL',
      created_at: '22 Ağu 2026',
      shipment_count: 1,
      product_count: 5,
      receiver: 'Anar Mamedov',
      products: [bundleProduct, normalProduct],
      cancelled_items: [],
      returned_items: [],
    } as never);
  }

  it('marks the bundle line so the card can show the PAKET badge', () => {
    const order = makeOrder();
    const [bundle, normal] = order.products;

    expect(bundle.isBundle).toBe(true);
    expect(bundle.bundleGroupId).toBe('101703d9-b539-458e-ba74-8f334359e14f');
    expect(bundle.name).toBe('Deneme bundle');
    // Normal ürün etkilenmez.
    expect(normal.isBundle).toBeUndefined();
    expect(normal.bundleComponents).toBeUndefined();
  });

  it('maps the package contents listed under the bundle line', () => {
    const [bundle] = makeOrder().products;

    expect(bundle.bundleComponents).toHaveLength(2);
    // Bu uçta ad/slug `product_name`/`product_slug` olarak gelir.
    expect(bundle.bundleComponents?.[0]).toMatchObject({
      orderItemId: 11845555,
      title: 'Kemer Detaylı Yarım Kol Elbise Siyah - 52521.2204.',
      slug: 'kemer-detayli-yarim-kol-elbise-siyah-525212204',
      variantName: 'L',
      quantity: 1,
      imageUrl: 'https://cdn/elbise.webp',
    });
    expect(bundle.bundleComponents?.[1].title).toBe('Raşel Kumaş İkili Takım Açıkhaki - 75247.801.');
  });

  it('keeps the bundle as a single line in the products list', () => {
    // Paket 4 üründen oluşsa da listede TEK satır; içindekiler ayrı satır değildir.
    expect(makeOrder().products).toHaveLength(2);
  });
});
