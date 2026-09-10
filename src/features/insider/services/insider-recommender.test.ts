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
  const onDiagnostic = jest.fn();
  const onRawPayload = jest.fn();
  const recommender = createInsiderRecommender({
    isNativeSdkAvailable: () => true,
    loadSdk: () => sdk,
    onError,
    onDiagnostic,
    onRawPayload,
    timeoutMs: 50,
  });

  return { onDiagnostic, onError, onRawPayload, product, recommender, sdk };
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
    const { onDiagnostic, recommender, sdk } = createHarness();

    const result = await recommender.fetchRecommendationForProductIds(7, ['', '   ']);

    expect(sdk.getSmartRecommendationWithProductIDs).not.toHaveBeenCalled();
    expect(result.products).toEqual([]);
    expect(onDiagnostic).toHaveBeenCalledWith(
      expect.stringContaining('geçerli ürün kimliği yok'),
    );
  });

  it('resolves empty and reports the skip when the native SDK is unavailable (Expo Go)', async () => {
    const onDiagnostic = jest.fn();
    const recommender = createInsiderRecommender({
      isNativeSdkAvailable: () => false,
      loadSdk: () => {
        throw new Error('SDK yüklenmemeli');
      },
      onError: jest.fn(),
      onDiagnostic,
      onRawPayload: jest.fn(),
      timeoutMs: 50,
    });

    await expect(recommender.fetchRecommendation(7)).resolves.toEqual({
      products: [],
      productIds: [],
    });
    expect(onDiagnostic).toHaveBeenCalledWith(expect.stringContaining('kampanya=7'));
    expect(onDiagnostic).toHaveBeenCalledWith(expect.stringContaining('native SDK yok'));
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
    const { onDiagnostic, recommender } = createHarness({
      getSmartRecommendation: jest.fn((_id, _locale, _currency, callback) => {
        callback(DETAILED_RESPONSE);
        callback({ success: true, data: [] });
      }),
    });

    const result = await recommender.fetchRecommendation(7);

    expect(result.products).toHaveLength(1);
    // Teşhis log'u da yanıt başına bir kez yazılmalı, yoksa cihaz log'u yanıltır.
    expect(onDiagnostic).toHaveBeenCalledTimes(1);
  });

  /**
   * Boş slider'ın nedeni dışarıdan görünmediği için her yanıt teşhis kanalına
   * kampanya kimliğiyle yazılır; cihaz log'undan hangi kampanyanın ne döndürdüğü
   * ayırt edilebilmeli.
   */
  it('reports every response with its campaign id', async () => {
    const { onDiagnostic, recommender } = createHarness({
      getSmartRecommendation: jest.fn((_id, _locale, _currency, callback) =>
        callback({ ...DETAILED_RESPONSE, total: 25, types: { mpop: 25 } }),
      ),
    });

    await recommender.fetchRecommendation(2);

    expect(onDiagnostic).toHaveBeenCalledWith(expect.stringContaining('kampanya=2'));
    expect(onDiagnostic).toHaveBeenCalledWith(expect.stringContaining('1 ürün'));
    expect(onDiagnostic).toHaveBeenCalledWith(expect.stringContaining('types=mpop:25'));
  });

  it('separates a details=false response from an empty one in the diagnostic log', async () => {
    const { onDiagnostic, recommender } = createHarness({
      getSmartRecommendation: jest.fn((_id, _locale, _currency, callback) =>
        callback({ success: true, total: 3, data: ['11', '12', '13'] }),
      ),
    });

    const result = await recommender.fetchRecommendation(6);

    expect(result.products).toEqual([]);
    expect(onDiagnostic).toHaveBeenCalledWith(expect.stringContaining('details=false'));
  });

  /**
   * Ham yanıt, backend çağrılarının `🔵 API ...` log'uyla aynı akışta okunabilsin diye
   * ayrı kanala yazılır: metot adı, gönderilen parametreler ve yanıt gövdesi birlikte.
   */
  it('forwards the raw request and response for the development log', async () => {
    const { onRawPayload, recommender } = createHarness();

    await recommender.fetchRecommendationForProductIds(5, ['11', '22']);

    expect(onRawPayload).toHaveBeenCalledWith({
      method: 'getSmartRecommendationWithProductIDs',
      params: { locale: 'tr_TR', currency: 'TRY', productIDs: ['11', '22'] },
      payload: DETAILED_RESPONSE,
      recommendationId: 5,
    });
  });

  it('names the campaign in the timeout report', async () => {
    const { onError, recommender } = createHarness({
      getSmartRecommendation: jest.fn(() => undefined),
    });

    await recommender.fetchRecommendation(4);

    expect(onError).toHaveBeenCalledWith(expect.stringContaining('kampanya=4'), null);
  });
});
