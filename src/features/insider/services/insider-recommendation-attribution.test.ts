import {
  MAX_REMEMBERED_CLICKS,
  RECOMMENDATION_CLICK_TTL_MS,
  createRecommendationAttributionStore,
} from './insider-recommendation-attribution';

function createStorage(initial: Record<string, string> = {}) {
  const values = { ...initial };
  return {
    getItem: jest.fn((key: string) => values[key] ?? null),
    removeItem: jest.fn((key: string) => {
      delete values[key];
    }),
    setItem: jest.fn((key: string, value: string) => {
      values[key] = value;
    }),
    values,
  };
}

describe('recommendation attribution store', () => {
  it('returns the click for the product id it was recorded with', () => {
    const store = createRecommendationAttributionStore({
      now: () => 1_000,
      storage: createStorage(),
      ttlMs: RECOMMENDATION_CLICK_TTL_MS,
    });

    store.remember({ matchKeys: ['12345'], productId: '12345', recommendationId: 2 });

    expect(store.resolve(['12345'])).toMatchObject({ productId: '12345', recommendationId: 2 });
  });

  // Öneri kartındaki kimlik feed'den, sepetteki kimlik backend'den geliyor;
  // ayrıştıklarında slug tek eşleşme anahtarı kalır.
  it('matches on the slug when the feed id and the backend id differ', () => {
    const store = createRecommendationAttributionStore({
      now: () => 1_000,
      storage: createStorage(),
      ttlMs: RECOMMENDATION_CLICK_TTL_MS,
    });

    store.remember({
      matchKeys: ['P-12345', 'mavi-elbise-12345'],
      productId: 'P-12345',
      recommendationId: 1,
    });

    expect(store.resolve(['12345', 'mavi-elbise-12345'])?.productId).toBe('P-12345');
  });

  it('returns null for an unrelated product and for empty keys', () => {
    const store = createRecommendationAttributionStore({
      now: () => 1_000,
      storage: createStorage(),
      ttlMs: RECOMMENDATION_CLICK_TTL_MS,
    });

    store.remember({ matchKeys: ['12345'], productId: '12345', recommendationId: 2 });

    expect(store.resolve(['99999'])).toBeNull();
    expect(store.resolve([])).toBeNull();
    expect(store.resolve(['', '   ', null, undefined])).toBeNull();
  });

  it('drops clicks once the attribution window has passed', () => {
    let now = 1_000;
    const store = createRecommendationAttributionStore({
      now: () => now,
      storage: createStorage(),
      ttlMs: 1_000,
    });

    store.remember({ matchKeys: ['12345'], productId: '12345', recommendationId: 2 });
    now = 2_500;

    expect(store.resolve(['12345'])).toBeNull();
  });

  it('keeps the newest click when the same product is clicked again', () => {
    const store = createRecommendationAttributionStore({
      now: () => 1_000,
      storage: createStorage(),
      ttlMs: RECOMMENDATION_CLICK_TTL_MS,
    });

    store.remember({ matchKeys: ['12345'], productId: '12345', recommendationId: 2 });
    store.remember({ matchKeys: ['12345'], productId: '12345', recommendationId: 6 });

    expect(store.resolve(['12345'])?.recommendationId).toBe(6);
  });

  it('caps the remembered clicks so the memory cannot grow without bound', () => {
    const store = createRecommendationAttributionStore({
      now: () => 1_000,
      storage: createStorage(),
      ttlMs: RECOMMENDATION_CLICK_TTL_MS,
    });

    const total = MAX_REMEMBERED_CLICKS + 5;
    for (let index = 0; index < total; index += 1) {
      store.remember({ matchKeys: [`id-${index}`], productId: `id-${index}`, recommendationId: 1 });
    }

    expect(store.resolve(['id-0'])).toBeNull();
    expect(store.resolve([`id-${total - 1}`])).not.toBeNull();
  });

  // 3D Secure sırasında Android süreci öldürebiliyor; kalıcı kopya olmadan
  // satın alma eventi tıklamayla eşleşemezdi.
  it('restores clicks written before the process was killed', async () => {
    const storage = createStorage();
    const first = createRecommendationAttributionStore({
      now: () => 1_000,
      storage,
      ttlMs: RECOMMENDATION_CLICK_TTL_MS,
    });
    first.remember({ matchKeys: ['12345'], productId: '12345', recommendationId: 7 });

    const afterRestart = createRecommendationAttributionStore({
      now: () => 2_000,
      storage,
      ttlMs: RECOMMENDATION_CLICK_TTL_MS,
    });
    expect(afterRestart.resolve(['12345'])).toBeNull();

    await afterRestart.restore();

    expect(afterRestart.resolve(['12345'])?.recommendationId).toBe(7);
  });

  it('starts empty instead of throwing when the persisted record is unreadable', async () => {
    const store = createRecommendationAttributionStore({
      now: () => 1_000,
      storage: createStorage({ 'insider.recommendation-clicks': '{bozuk' }),
      ttlMs: RECOMMENDATION_CLICK_TTL_MS,
    });

    await expect(store.restore()).resolves.toBeUndefined();
    expect(store.resolve(['12345'])).toBeNull();
  });

  it('ignores a click without a usable product id', () => {
    const store = createRecommendationAttributionStore({
      now: () => 1_000,
      storage: createStorage(),
      ttlMs: RECOMMENDATION_CLICK_TTL_MS,
    });

    store.remember({ matchKeys: ['mavi-elbise'], productId: '   ', recommendationId: 2 });

    expect(store.resolve(['mavi-elbise'])).toBeNull();
  });

  it('clears both the memory and the persisted copy', () => {
    const storage = createStorage();
    const store = createRecommendationAttributionStore({
      now: () => 1_000,
      storage,
      ttlMs: RECOMMENDATION_CLICK_TTL_MS,
    });
    store.remember({ matchKeys: ['12345'], productId: '12345', recommendationId: 2 });

    store.clear();

    expect(store.resolve(['12345'])).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith('insider.recommendation-clicks');
  });
});
