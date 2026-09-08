import { mapCartCampaignBannerStatus, mapCartItemDto, mapCartResponse } from './cart.mapper';
import { CartCampaignDto, CartCampaignsResponseDto, CartItemDto } from './cart.dtos';

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

function makeCampaign(overrides: Partial<CartCampaignDto> = {}): CartCampaignDto {
  return {
    id: 1,
    name: 'Sepette 2.000 TL',
    type: 'cart_discount',
    is_applicable: false,
    threshold: 2000,
    remaining: 2000,
    ...overrides,
  };
}

describe('mapCartCampaignBannerStatus', () => {
  it('maps the campaign whose message matches primary_campaign_message', () => {
    const dto: CartCampaignsResponseDto = {
      subtotal: 0,
      campaign_basis: 0,
      primary_campaign_message: 'Kampanyadan faydalanabilmek için sepetine 2.000 TL\'lik daha ürün eklemelisin.',
      campaigns: [
        makeCampaign({ id: 9, name: 'Kargo', message: 'Başka bir mesaj', threshold: 500 }),
        makeCampaign({
          message: 'Kampanyadan faydalanabilmek için sepetine 2.000 TL\'lik daha ürün eklemelisin.',
        }),
      ],
    };

    expect(mapCartCampaignBannerStatus(dto)).toEqual({
      campaignName: 'Sepette 2.000 TL',
      currentAmount: 0,
      threshold: 2000,
      message: 'Kampanyadan faydalanabilmek için sepetine 2.000 TL\'lik daha ürün eklemelisin.',
      progress: 0,
    });
  });

  it('falls back to the first campaign that still has a remaining amount', () => {
    const status = mapCartCampaignBannerStatus({
      campaign_basis: 500,
      primary_campaign_message: null,
      campaigns: [
        makeCampaign({ id: 1, remaining: 0, message: 'Tamamlandı' }),
        makeCampaign({ id: 2, name: 'İkinci', remaining: 1500, message: '1.500 TL kaldı' }),
      ],
    });

    expect(status?.message).toBe('1.500 TL kaldı');
    expect(status?.campaignName).toBe('İkinci');
  });

  it('falls back to the first campaign with any message when none has a remaining amount', () => {
    const status = mapCartCampaignBannerStatus({
      primary_campaign_message: null,
      campaigns: [
        makeCampaign({ id: 1, remaining: 0, message: '   ' }),
        makeCampaign({ id: 2, remaining: 0, message: 'Son mesaj' }),
      ],
    });

    expect(status?.message).toBe('Son mesaj');
  });

  it('ignores the primary-message step when the backend sends no primary message', () => {
    // Aksi halde boş primary mesaj, mesajı boşluktan ibaret olan ilk kampanyayla
    // eşleşip gösterilebilir kampanyayı olan bandı tamamen susturuyor.
    const status = mapCartCampaignBannerStatus({
      campaign_basis: 250,
      primary_campaign_message: null,
      campaigns: [
        makeCampaign({ id: 1, remaining: 0, message: '' }),
        makeCampaign({ id: 2, name: 'Gösterilecek', remaining: 750, message: '750 TL kaldı' }),
      ],
    });

    expect(status).not.toBeNull();
    expect(status?.message).toBe('750 TL kaldı');
  });

  it('prefers campaign_basis over subtotal for the current amount', () => {
    const status = mapCartCampaignBannerStatus({
      subtotal: 900,
      campaign_basis: 750,
      primary_campaign_message: 'Devam et',
      campaigns: [makeCampaign({ message: 'Devam et' })],
    });

    expect(status?.currentAmount).toBe(750);
  });

  it('uses subtotal when campaign_basis is missing and parses numeric strings', () => {
    const status = mapCartCampaignBannerStatus({
      subtotal: '1250.5',
      primary_campaign_message: 'Devam et',
      campaigns: [makeCampaign({ message: 'Devam et' })],
    });

    expect(status?.currentAmount).toBe(1250.5);
  });

  it('drops a non-positive threshold so the banner shows a single amount', () => {
    const status = mapCartCampaignBannerStatus({
      campaign_basis: 100,
      primary_campaign_message: 'Kampanya aktif',
      campaigns: [makeCampaign({ threshold: 0, message: 'Kampanya aktif' })],
    });

    expect(status?.threshold).toBeNull();
    expect(status?.progress).toBe(100);
  });

  it('derives progress from the threshold and clamps it to 100', () => {
    const derived = mapCartCampaignBannerStatus({
      campaign_basis: 500,
      primary_campaign_message: 'Devam et',
      campaigns: [makeCampaign({ message: 'Devam et' })],
    });
    expect(derived?.progress).toBe(25);

    const clamped = mapCartCampaignBannerStatus({
      campaign_basis: 9000,
      primary_campaign_message: 'Devam et',
      campaigns: [makeCampaign({ message: 'Devam et' })],
    });
    expect(clamped?.progress).toBe(100);
  });

  it('prefers the backend progress_percentage when present', () => {
    const status = mapCartCampaignBannerStatus({
      campaign_basis: 500,
      primary_campaign_message: 'Devam et',
      campaigns: [makeCampaign({ message: 'Devam et', progress_percentage: 42 })],
    });

    expect(status?.progress).toBe(42);
  });

  it('falls back to a generic campaign name when the backend sends none', () => {
    const status = mapCartCampaignBannerStatus({
      primary_campaign_message: 'Devam et',
      campaigns: [makeCampaign({ name: '   ', message: 'Devam et' })],
    });

    expect(status?.campaignName).toBe('Sepet Kampanyası');
  });

  it('returns null when there is nothing displayable', () => {
    expect(mapCartCampaignBannerStatus(null)).toBeNull();
    expect(mapCartCampaignBannerStatus(undefined)).toBeNull();
    expect(mapCartCampaignBannerStatus({})).toBeNull();
    expect(mapCartCampaignBannerStatus({ campaigns: [] })).toBeNull();
    expect(
      mapCartCampaignBannerStatus({ campaigns: [makeCampaign({ message: null })] }),
    ).toBeNull();
    expect(
      mapCartCampaignBannerStatus({
        primary_campaign_message: '   ',
        campaigns: [makeCampaign({ message: '   ' })],
      }),
    ).toBeNull();
  });
});
