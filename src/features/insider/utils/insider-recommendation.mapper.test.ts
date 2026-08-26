import {
  EMPTY_INSIDER_RECOMMENDATION,
  getRecommendedProductRouteParam,
  InsiderRecommendedProduct,
  mapInsiderRecommendation,
  recommendedProductToInsiderInput,
} from './insider-recommendation.mapper';

const CURRENCY = 'TRY';

function makeRecommended(
  overrides: Partial<InsiderRecommendedProduct> = {},
): InsiderRecommendedProduct {
  return {
    id: '1361384',
    name: 'Kadın Bluz',
    imageUrl: 'https://cdn.example.com/1.jpg',
    url: 'https://haydigiy.com/product/kadin-bluz',
    brand: 'HaydiGiy',
    price: 199,
    originalPrice: null,
    inStock: true,
    taxonomy: ['Giyim', 'Bluz'],
    ...overrides,
  };
}

describe('mapInsiderRecommendation', () => {
  it('maps a detailed response into domain products', () => {
    const result = mapInsiderRecommendation(
      {
        success: true,
        total: 2,
        data: [
          {
            item_id: '1361384',
            name: 'Kadın Bluz',
            image_url: 'https://cdn.example.com/1.jpg',
            url: 'https://haydigiy.com/product/kadin-bluz',
            brand: 'HaydiGiy',
            in_stock: 1,
            price: { TRY: 149.9 },
            original_price: { TRY: 199.9 },
            product_type: 'Giyim > Üst Giyim > Bluz',
          },
        ],
      },
      CURRENCY,
    );

    expect(result.products).toEqual([
      {
        id: '1361384',
        name: 'Kadın Bluz',
        imageUrl: 'https://cdn.example.com/1.jpg',
        url: 'https://haydigiy.com/product/kadin-bluz',
        brand: 'HaydiGiy',
        price: 149.9,
        originalPrice: 199.9,
        inStock: true,
        taxonomy: ['Giyim', 'Üst Giyim', 'Bluz'],
      },
    ]);
    expect(result.productIds).toEqual(['1361384']);
  });

  it('drops the original price when the product is not discounted', () => {
    const result = mapInsiderRecommendation(
      {
        success: true,
        data: [
          {
            item_id: '10',
            name: 'Ürün',
            price: { TRY: 100 },
            original_price: { TRY: 100 },
          },
        ],
      },
      CURRENCY,
    );

    expect(result.products[0].price).toBe(100);
    expect(result.products[0].originalPrice).toBeNull();
  });

  it('reads the id-only response shape (details: false)', () => {
    const result = mapInsiderRecommendation(
      { success: true, total: 3, data: ['1111111', '1111112', '1111113'] },
      CURRENCY,
    );

    expect(result.products).toEqual([]);
    expect(result.productIds).toEqual(['1111111', '1111112', '1111113']);
  });

  it('falls back to the first available currency key', () => {
    const result = mapInsiderRecommendation(
      { success: true, data: [{ item_id: '10', name: 'Ürün', price: { USD: 25 } }] },
      CURRENCY,
    );

    expect(result.products[0].price).toBe(25);
  });

  it('skips entries without an id or name', () => {
    const result = mapInsiderRecommendation(
      {
        success: true,
        data: [
          { item_id: '', name: 'Adsız kimlik' },
          { item_id: '12', name: '' },
          { item_id: '13', name: 'Geçerli' },
        ],
      },
      CURRENCY,
    );

    expect(result.products.map((product) => product.id)).toEqual(['13']);
  });

  it('never throws on unexpected payloads', () => {
    expect(mapInsiderRecommendation(null, CURRENCY)).toEqual(EMPTY_INSIDER_RECOMMENDATION);
    expect(mapInsiderRecommendation(undefined, CURRENCY)).toEqual(EMPTY_INSIDER_RECOMMENDATION);
    expect(mapInsiderRecommendation({ success: false }, CURRENCY)).toEqual(
      EMPTY_INSIDER_RECOMMENDATION,
    );
    expect(mapInsiderRecommendation({ success: true, data: 'bozuk' }, CURRENCY)).toEqual(
      EMPTY_INSIDER_RECOMMENDATION,
    );
  });
});

describe('recommendedProductToInsiderInput', () => {
  it('keeps the Insider item id so click, add-to-cart and purchase stats match', () => {
    const input = recommendedProductToInsiderInput(makeRecommended(), CURRENCY);

    expect(input.id).toBe('1361384');
    expect(input.price).toBe(199);
    expect(input.salePrice).toBeUndefined();
    expect(input.stock).toBe(1);
    expect(input.currency).toBe(CURRENCY);
  });

  it('maps a discount onto price + salePrice the way Insider expects', () => {
    const input = recommendedProductToInsiderInput(
      makeRecommended({ price: 149.9, originalPrice: 199.9 }),
      CURRENCY,
    );

    expect(input.price).toBe(199.9);
    expect(input.salePrice).toBe(149.9);
  });

  it('falls back to the default taxonomy and zero stock', () => {
    const input = recommendedProductToInsiderInput(
      makeRecommended({ taxonomy: [], inStock: false }),
      CURRENCY,
    );

    expect(input.taxonomy.length).toBeGreaterThan(0);
    expect(input.stock).toBe(0);
  });
});

describe('getRecommendedProductRouteParam', () => {
  it('prefers the slug from the feed url', () => {
    expect(getRecommendedProductRouteParam(makeRecommended())).toBe('kadin-bluz');
    expect(
      getRecommendedProductRouteParam(
        makeRecommended({ url: 'https://haydigiy.com/product/kadin-bluz?utm=insider' }),
      ),
    ).toBe('kadin-bluz');
  });

  it('falls back to the item id when the url is missing or unusable', () => {
    expect(getRecommendedProductRouteParam(makeRecommended({ url: null }))).toBe('1361384');
    expect(
      getRecommendedProductRouteParam(makeRecommended({ url: 'https://haydigiy.com/product' })),
    ).toBe('1361384');
  });
});
