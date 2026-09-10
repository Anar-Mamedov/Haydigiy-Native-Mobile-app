import {
  describeInsiderRecommendationResponse,
  describeInsiderRecommendationSkip,
  logInsiderRecommendationPayload,
} from './insider-recommendation-diagnostics';
import { InsiderRecommendation } from './insider-recommendation.mapper';

const EMPTY: InsiderRecommendation = { products: [], productIds: [] };

function withProducts(count: number): InsiderRecommendation {
  const products = Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: `Ürün ${index + 1}`,
    imageUrl: null,
    url: null,
    brand: null,
    price: 100,
    originalPrice: null,
    inStock: true,
    taxonomy: [],
  }));

  return { products, productIds: products.map((product) => product.id) };
}

describe('describeInsiderRecommendationSkip', () => {
  it('names the campaign and the reason the request never left the app', () => {
    const message = describeInsiderRecommendationSkip(3, 'native SDK yok');

    expect(message).toContain('kampanya=3');
    expect(message).toContain('native SDK yok');
  });
});

describe('describeInsiderRecommendationResponse', () => {
  it('reports the product count and the serving algorithms on a successful response', () => {
    const message = describeInsiderRecommendationResponse(
      2,
      { success: true, total: 25, types: { mpop: 25 } },
      withProducts(12),
    );

    expect(message).toContain('kampanya=2');
    expect(message).toContain('12 ürün');
    expect(message).toContain('total=25');
    // Algoritma kısaltması, paneldeki algoritma ile metodun uyuşmasını doğrular.
    expect(message).toContain('types=mpop:25');
  });

  /**
   * `details: false` ile kurulan kampanya ürün nesnesi yerine kimlik listesi döndürür;
   * slider bu biçimi çizemediği için boş sonuçtan ayırt edilebilmesi şart.
   */
  it('flags a details=false response separately from an empty one', () => {
    const message = describeInsiderRecommendationResponse(
      6,
      { success: true, total: 25, types: { mpop: 25 } },
      { products: [], productIds: ['1', '2', '3'] },
    );

    expect(message).toContain('3 kimlik');
    expect(message).toContain('details=false');
  });

  it('reports a rejected response', () => {
    const message = describeInsiderRecommendationResponse(4, { success: false }, EMPTY);

    expect(message).toContain('success=false');
  });

  it('reports an accepted but empty response', () => {
    const message = describeInsiderRecommendationResponse(
      7,
      { success: true, total: 0 },
      EMPTY,
    );

    expect(message).toContain('boş yanıt');
    expect(message).toContain('total=0');
  });

  it('reports an unreadable payload', () => {
    expect(describeInsiderRecommendationResponse(1, null, EMPTY)).toContain('yanıt okunamadı');
  });

  // Yanıt gövdesi ürün adı ve kullanıcı verisi taşıyabilir; log'a yalnızca sayılar girer.
  it('never writes response body values other than total and types into the log', () => {
    const message = describeInsiderRecommendationResponse(
      2,
      {
        success: true,
        total: 1,
        types: { mpop: 1 },
        data: [{ item_id: '999', name: 'Gizli Ürün', email: 'user@example.com' }],
      },
      withProducts(1),
    );

    expect(message).not.toContain('Gizli Ürün');
    expect(message).not.toContain('user@example.com');
    expect(message).not.toContain('999');
  });
});

describe('logInsiderRecommendationPayload', () => {
  const PAYLOAD = { success: true, total: 1, data: [{ item_id: '10' }] };

  function createSink() {
    const entries: { label: string; body: unknown }[] = [];
    return { sink: { log: (label: string, body: unknown) => entries.push({ label, body }) }, entries };
  }

  it('writes the SDK method, the sent params and the raw response in one entry', () => {
    const { sink, entries } = createSink();

    logInsiderRecommendationPayload(
      {
        method: 'getSmartRecommendationWithProductIDs',
        params: { locale: 'tr_TR', currency: 'TRY', productIDs: ['11'] },
        payload: PAYLOAD,
        recommendationId: 5,
      },
      sink,
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].label).toContain('getSmartRecommendationWithProductIDs');
    expect(entries[0].label).toContain('kampanya=5');
    // DevTools konsolundaki `API` filtresi bu çağrıyı da yakalamalı.
    expect(entries[0].label).toContain('API');
    expect(entries[0].body).toEqual({
      request: { locale: 'tr_TR', currency: 'TRY', productIDs: ['11'] },
      response: PAYLOAD,
    });
  });

  // Yanıt gövdesi ürün verisi taşır; üretim log'una yazılmamalı.
  it('stays silent outside development builds', () => {
    const { sink, entries } = createSink();
    const runtime = globalThis as { __DEV__?: boolean };
    const original = runtime.__DEV__;
    runtime.__DEV__ = false;

    try {
      logInsiderRecommendationPayload(
        { method: 'getSmartRecommendation', params: {}, payload: PAYLOAD, recommendationId: 2 },
        sink,
      );
    } finally {
      runtime.__DEV__ = original;
    }

    expect(entries).toHaveLength(0);
  });
});
