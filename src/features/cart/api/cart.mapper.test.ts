import {
  mapCartCampaignBannerStatus,
  mapCartCampaignDto,
  mapCartItemDto,
  mapCartResponse,
} from './cart.mapper';
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

  it('carries the line campaign discount and discounted total', () => {
    const item = mapCartItemDto(makeDto({ campaign_discount: 40, campaign_total: 160 }));
    expect(item.campaignDiscount).toBe(40);
    expect(item.campaignTotal).toBe(160);
  });

  it('parses campaign amounts sent as numeric strings', () => {
    const item = mapCartItemDto(makeDto({ campaign_discount: '40.00', campaign_total: '160.00' }));
    expect(item.campaignDiscount).toBe(40);
    expect(item.campaignTotal).toBe(160);
  });

  // İndirim ve indirimli toplam yalnızca birlikte anlamlı; biri eksikse satır
  // normal fiyatıyla gösterilmeli, yarım bir kampanya fiyatı sızmamalı.
  it('drops the campaign price unless both fields are usable', () => {
    expect(mapCartItemDto(makeDto({ campaign_discount: 0, campaign_total: 200 }))).not.toHaveProperty(
      'campaignTotal',
    );
    expect(
      mapCartItemDto(makeDto({ campaign_discount: 40, campaign_total: null })),
    ).not.toHaveProperty('campaignTotal');
    expect(mapCartItemDto(makeDto())).not.toHaveProperty('campaignDiscount');
  });
});

describe('mapCartCampaignDto', () => {
  const campaignDto = (overrides: Partial<CartCampaignDto> = {}): CartCampaignDto => ({
    id: 7,
    name: 'Sepette %10 indirim',
    type: 'cart_discount',
    is_applicable: true,
    threshold: 1000,
    remaining: 0,
    end_date: '2026-07-01T00:00:00Z',
    ...overrides,
  });

  it('maps a campaign into the domain model', () => {
    expect(mapCartCampaignDto(campaignDto({ counter: 1, discount: 50 }))).toEqual({
      id: 7,
      name: 'Sepette %10 indirim',
      type: 'cart_discount',
      isApplicable: true,
      threshold: 1000,
      remaining: 0,
      discount: 50,
      endDate: '2026-07-01T00:00:00Z',
      message: null,
      progressPercentage: undefined,
      counter: 1,
    });
  });

  // Sayaç anahtarı gelmediğinde geri sayım kapalı kalmalı; `1` dışındaki her
  // değer (0 dahil) gizler.
  it('leaves the counter undefined when the backend omits it', () => {
    expect(mapCartCampaignDto(campaignDto()).counter).toBeUndefined();
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

const FREE_SHIPPING_MESSAGE = 'Tebrikler! Ücretsiz kargo hakkı kazandınız.';
const CART_DISCOUNT_MESSAGE = 'Sepet İndirimi ile 36,60 TL indirim uygulandı.';
const CATEGORY_DISCOUNT_MESSAGE = 'Kategori İndirimi ile 61,00 TL indirim uygulandı.';

/** Backend'in aynı sepet için üç kampanya birden döndürdüğü gerçek yanıt. */
function makeMultiCampaignResponse(): CartCampaignsResponseDto {
  return {
    subtotal: 1219.97,
    campaign_basis: 1219.97,
    primary_campaign_message: FREE_SHIPPING_MESSAGE,
    campaigns: [
      makeCampaign({
        id: 62,
        name: 'Kargo Kampanyası',
        type: 'free_shipping',
        is_applicable: true,
        threshold: 1,
        remaining: 0,
        progress_percentage: 100,
        message: FREE_SHIPPING_MESSAGE,
      }),
      makeCampaign({
        id: 63,
        name: 'Sepet İndirimi',
        is_applicable: true,
        threshold: 1,
        remaining: 0,
        progress_percentage: 100,
        discount: 36.6,
        message: CART_DISCOUNT_MESSAGE,
      }),
      makeCampaign({
        id: 64,
        name: 'Kategori İndirimi',
        is_applicable: true,
        threshold: 1,
        remaining: 0,
        progress_percentage: 100,
        discount: 61,
        message: CATEGORY_DISCOUNT_MESSAGE,
      }),
    ],
  };
}

describe('mapCartCampaignBannerStatus', () => {
  it('turns every displayable campaign into a carousel slide', () => {
    const status = mapCartCampaignBannerStatus(makeMultiCampaignResponse());

    expect(status?.currentAmount).toBe(1219.97);
    expect(status?.slides).toEqual([
      {
        id: '62',
        campaignName: 'Kargo Kampanyası',
        threshold: 1,
        message: FREE_SHIPPING_MESSAGE,
        progress: 100,
      },
      {
        id: '63',
        campaignName: 'Sepet İndirimi',
        threshold: 1,
        message: CART_DISCOUNT_MESSAGE,
        progress: 100,
      },
      {
        id: '64',
        campaignName: 'Kategori İndirimi',
        threshold: 1,
        message: CATEGORY_DISCOUNT_MESSAGE,
        progress: 100,
      },
    ]);
  });

  it('moves the campaign flagged as primary to the first slide', () => {
    const response = makeMultiCampaignResponse();
    response.primary_campaign_message = CATEGORY_DISCOUNT_MESSAGE;

    const status = mapCartCampaignBannerStatus(response);

    // Öne alınan kampanya dışındakiler backend sırasını korur.
    expect(status?.slides.map((slide) => slide.id)).toEqual(['64', '62', '63']);
  });

  it('keeps the backend order when no campaign matches the primary message', () => {
    const response = makeMultiCampaignResponse();
    response.primary_campaign_message = 'Eşleşmeyen mesaj';

    const status = mapCartCampaignBannerStatus(response);

    expect(status?.slides.map((slide) => slide.id)).toEqual(['62', '63', '64']);
  });

  it('leaves out campaigns that have no message of their own', () => {
    const status = mapCartCampaignBannerStatus({
      campaign_basis: 500,
      primary_campaign_message: null,
      campaigns: [
        makeCampaign({ id: 1, message: null }),
        makeCampaign({ id: 2, message: '   ' }),
        makeCampaign({ id: 3, message: 'Gösterilecek' }),
      ],
    });

    expect(status?.slides).toHaveLength(1);
    expect(status?.slides[0]).toMatchObject({ id: '3', message: 'Gösterilecek' });
  });

  it('prefers campaign_basis over subtotal for the shared amount', () => {
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

  it('drops a non-positive threshold so the slide shows a single amount', () => {
    const status = mapCartCampaignBannerStatus({
      campaign_basis: 100,
      primary_campaign_message: 'Kampanya aktif',
      campaigns: [makeCampaign({ threshold: 0, message: 'Kampanya aktif' })],
    });

    expect(status?.slides[0].threshold).toBeNull();
    expect(status?.slides[0].progress).toBe(100);
  });

  it('derives progress from each campaign threshold and clamps it to 100', () => {
    const derived = mapCartCampaignBannerStatus({
      campaign_basis: 500,
      primary_campaign_message: 'Devam et',
      campaigns: [makeCampaign({ message: 'Devam et' })],
    });
    expect(derived?.slides[0].progress).toBe(25);

    const clamped = mapCartCampaignBannerStatus({
      campaign_basis: 9000,
      primary_campaign_message: 'Devam et',
      campaigns: [makeCampaign({ message: 'Devam et' })],
    });
    expect(clamped?.slides[0].progress).toBe(100);
  });

  it('prefers the backend progress_percentage when present', () => {
    const status = mapCartCampaignBannerStatus({
      campaign_basis: 500,
      primary_campaign_message: 'Devam et',
      campaigns: [makeCampaign({ message: 'Devam et', progress_percentage: 42 })],
    });

    expect(status?.slides[0].progress).toBe(42);
  });

  it('falls back to a generic campaign name when the backend sends none', () => {
    const status = mapCartCampaignBannerStatus({
      primary_campaign_message: 'Devam et',
      campaigns: [makeCampaign({ name: '   ', message: 'Devam et' })],
    });

    expect(status?.slides[0].campaignName).toBe('Sepet Kampanyası');
  });

  it('shows the primary message alone when no campaign carries one', () => {
    const status = mapCartCampaignBannerStatus({
      campaign_basis: 100,
      primary_campaign_message: 'Yalnızca genel mesaj',
      campaigns: [makeCampaign({ message: null })],
    });

    expect(status?.slides).toEqual([
      {
        id: 'primary',
        campaignName: 'Sepet Kampanyası',
        threshold: null,
        message: 'Yalnızca genel mesaj',
        progress: 0,
      },
    ]);
  });

  it('returns null when there is nothing displayable', () => {
    expect(mapCartCampaignBannerStatus(null)).toBeNull();
    expect(mapCartCampaignBannerStatus(undefined)).toBeNull();
    expect(mapCartCampaignBannerStatus({})).toBeNull();
    expect(mapCartCampaignBannerStatus({ campaigns: [] })).toBeNull();
    expect(mapCartCampaignBannerStatus({ campaigns: [makeCampaign({ message: null })] })).toBeNull();
    expect(
      mapCartCampaignBannerStatus({
        primary_campaign_message: '   ',
        campaigns: [makeCampaign({ message: '   ' })],
      }),
    ).toBeNull();
  });
});
