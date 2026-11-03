import { META_CLICK_ID_TTL_MS, createMetaClickIdStore } from './meta-click-id-store';

const STORAGE_KEY = 'analytics.meta-click-id';
const FIRST = 'IwAR0firstClickId123';
const SECOND = 'IwAR0secondClickId456';

const adLink = (fbclid: string) => `https://haydigiy.com/urun-123?fbclid=${fbclid}`;

function createStore(startAt = 1_700_000_000_000, initial: Record<string, string> = {}) {
  let now = startAt;
  const data = new Map(Object.entries(initial));
  const storage = {
    getItem: jest.fn(async (key: string) => data.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      data.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      data.delete(key);
    }),
  };

  return {
    store: createMetaClickIdStore({ storage, now: () => now }),
    storage,
    data,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

describe('meta click id store', () => {
  it('stores the click id from an ad link and returns it in fbc format', async () => {
    const { store, data } = createStore();

    await store.capture(adLink(FIRST));

    await expect(store.getFbc()).resolves.toBe(`fb.1.1700000000000.${FIRST}`);
    expect(JSON.parse(data.get(STORAGE_KEY) ?? '{}')).toEqual({
      fbclid: FIRST,
      createdAt: 1_700_000_000_000,
    });
  });

  it('ignores links without a click id and keeps the earlier one', async () => {
    const { store, storage } = createStore();

    await store.capture(adLink(FIRST));
    await store.capture('https://haydigiy.com/sepet');

    await expect(store.getFbc()).resolves.toBe(`fb.1.1700000000000.${FIRST}`);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it('keeps the first-seen time when the same ad link reopens the app', async () => {
    const { store, advance } = createStore();

    await store.capture(adLink(FIRST));
    advance(60_000);
    await store.capture(adLink(FIRST));

    await expect(store.getFbc()).resolves.toBe(`fb.1.1700000000000.${FIRST}`);
  });

  it('replaces the click id when a newer ad is clicked', async () => {
    const { store, advance } = createStore();

    await store.capture(adLink(FIRST));
    advance(5_000);
    await store.capture(adLink(SECOND));

    await expect(store.getFbc()).resolves.toBe(`fb.1.1700000005000.${SECOND}`);
  });

  it('restores a stored click id after an app restart', async () => {
    const { store } = createStore(1_700_000_100_000, {
      [STORAGE_KEY]: JSON.stringify({ fbclid: FIRST, createdAt: 1_700_000_000_000 }),
    });

    await expect(store.getFbc()).resolves.toBe(`fb.1.1700000000000.${FIRST}`);
  });

  it('expires the click id after 90 days like the web _fbc cookie', async () => {
    const { store, advance, data } = createStore();

    await store.capture(adLink(FIRST));
    advance(META_CLICK_ID_TTL_MS);
    await expect(store.getFbc()).resolves.not.toBeNull();

    advance(1);
    await expect(store.getFbc()).resolves.toBeNull();
    expect(data.has(STORAGE_KEY)).toBe(false);
  });

  it('treats a corrupted stored value as no click id', async () => {
    for (const raw of ['{bozuk', 'null', JSON.stringify({ fbclid: '', createdAt: 1 }), JSON.stringify({ fbclid: FIRST })]) {
      const { store } = createStore(1_700_000_000_000, { [STORAGE_KEY]: raw });

      await expect(store.getFbc()).resolves.toBeNull();
    }
  });

  it('deletes the stored click id on clear', async () => {
    const { store, data } = createStore();

    await store.capture(adLink(FIRST));
    await store.clear();

    await expect(store.getFbc()).resolves.toBeNull();
    expect(data.has(STORAGE_KEY)).toBe(false);
  });

  it('reads storage once and serves later calls from memory', async () => {
    const { store, storage } = createStore();

    await store.getFbc();
    await store.getFbc();
    await store.capture(adLink(FIRST));
    await store.getFbc();

    expect(storage.getItem).toHaveBeenCalledTimes(1);
  });
});
