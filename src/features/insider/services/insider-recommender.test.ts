import {
  createInsiderRecommender,
  MAX_RECOMMENDATION_PRODUCT_IDS,
} from './insider-recommender';
import { InsiderProductSdk, InsiderSdk } from '../types/insider.types';
import { InsiderProductInput } from '../utils/insider-product.mapper';

const PRODUCT: InsiderProductInput = {
  id: '42',
  name: 'Kadın Bluz',
  taxonomy: ['Giyim'],
  imageUrl: 'https://cdn.example.com/1.jpg',
  price: 199,
  currency: 'TRY',
  stock: 7,
};

const DETAILED_RESPONSE = {
  success: true,
  data: [{ item_id: '10', name: 'Önerilen', price: { TRY: 100 } }],
};

function createProductMock(): jest.Mocked<InsiderProductSdk> {
  const product = {
    setSize: jest.fn(),
    setSalePrice: jest.fn(),
    setQuantity: jest.fn(),
    setStock: jest.fn(),
    setBrand: jest.fn(),
    setColor: jest.fn(),
    setProductURL: jest.fn(),
  } as unknown as jest.Mocked<InsiderProductSdk>;
  Object.values(product).forEach((fn) => {
    if (jest.isMockFunction(fn)) fn.mockReturnValue(product);
  });
  return product;
}

function createHarness(overrides: Partial<Record<string, unknown>> = {}) {
  const product = createProductMock();
  const sdk = {
    createNewProduct: jest.fn(() => product),
    getSmartRecommendation: jest.fn((_id, _locale, _currency, callback) => callback(DETAILED_RESPONSE)),
    getSmartRecommendationWithProduct: jest.fn((_product, _id, _locale, callback) =>
      callback(DETAILED_RESPONSE),
    ),
    getSmartRecommendationWithProductIDs: jest.fn((_ids, _id, _locale, _currency, callback) =>
      callback(DETAILED_RESPONSE),
    ),
    ...overrides,
  } as unknown as jest.Mocked<InsiderSdk>;

  const onError = jest.fn();
  const recommender = createInsiderRecommender({
    isNativeSdkAvailable: () => true,
    loadSdk: () => sdk,
    onError,
    timeoutMs: 50,
  });

  return { onError, product, recommender, sdk };
}

describe('createInsiderRecommender', () => {
  it('requests a product-free recommendation with locale and currency', async () => {
    const { recommender, sdk } = createHarness();

    const result = await recommender.fetchRecommendation(7);

    expect(sdk.getSmartRecommendation).toHaveBeenCalledWith(7, 'tr_TR', 'TRY', expect.any(Function));
    expect(result.products).toHaveLength(1);
    expect(result.products[0].id).toBe('10');
  });

  /**
   * SDK imzası bu metotta currency almıyor; fazladan parametre gönderilirse
   * `checkParameters` callback'i string sanar ve çağrı sessizce düşer.
   */
  it('calls the product-based method with exactly four arguments (no currency)', async () => {
    const { product, recommender, sdk } = createHarness();

    await recommender.fetchRecommendationForProduct(7, PRODUCT);

    expect(sdk.getSmartRecommendationWithProduct).toHaveBeenCalledWith(
      product,
      7,
      'tr_TR',
      expect.any(Function),
    );
    expect(sdk.getSmartRecommendationWithProduct.mock.calls[0]).toHaveLength(4);
    // Stok, Smart Recommender'ın ön koşulu.
    expect(product.setStock).toHaveBeenCalledWith(7);
  });

  it('sends at most three product ids and drops blanks', async () => {
    const { recommender, sdk } = createHarness();

    await recommender.fetchRecommendationForProductIds(7, ['1', '  ', '2', '3', '4']);

    const sentIds = sdk.getSmartRecommendationWithProductIDs.mock.calls[0][0];
    expect(sentIds).toEqual(['1', '2', '3']);
    expect(sentIds).toHaveLength(MAX_RECOMMENDATION_PRODUCT_IDS);
  });

  it('skips the call entirely when no usable product id is left', async () => {
    const { recommender, sdk } = createHarness();

    const result = await recommender.fetchRecommendationForProductIds(7, ['', '   ']);

    expect(sdk.getSmartRecommendationWithProductIDs).not.toHaveBeenCalled();
    expect(result.products).toEqual([]);
  });

  it('resolves empty when the native SDK is unavailable (Expo Go)', async () => {
    const recommender = createInsiderRecommender({
      isNativeSdkAvailable: () => false,
      loadSdk: () => {
        throw new Error('SDK yüklenmemeli');
      },
      onError: jest.fn(),
      timeoutMs: 50,
    });

    await expect(recommender.fetchRecommendation(7)).resolves.toEqual({
      products: [],
      productIds: [],
    });
  });

  it('resolves empty and reports when the SDK throws', async () => {
    const { onError, recommender } = createHarness({
      getSmartRecommendation: jest.fn(() => {
        throw new Error('native patladı');
      }),
    });

    const result = await recommender.fetchRecommendation(7);

    expect(result.products).toEqual([]);
    expect(onError).toHaveBeenCalled();
  });

  /** Callback hiç gelmezse ekran sonsuza kadar yükleniyor kalmamalı. */
  it('resolves empty when the callback never fires', async () => {
    const { onError, recommender } = createHarness({
      getSmartRecommendation: jest.fn(() => undefined),
    });

    const result = await recommender.fetchRecommendation(7);

    expect(result.products).toEqual([]);
    expect(onError).toHaveBeenCalled();
  });

  it('ignores a second callback invocation', async () => {
    const { recommender } = createHarness({
      getSmartRecommendation: jest.fn((_id, _locale, _currency, callback) => {
        callback(DETAILED_RESPONSE);
        callback({ success: true, data: [] });
      }),
    });

    const result = await recommender.fetchRecommendation(7);

    expect(result.products).toHaveLength(1);
  });
});
