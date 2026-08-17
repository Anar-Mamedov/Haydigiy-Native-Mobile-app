import {
  clearPurchaseSnapshot,
  consumePurchaseSnapshot,
  setPurchaseSnapshot,
} from './purchase-snapshot';
import { appStorage } from '@/lib/storage/mmkv';
import { CartLineItem } from '@/types/cart.types';

function makeItem(productId: string): CartLineItem {
  return {
    productId,
    title: `Ürün ${productId}`,
    imageUrl: '',
    sellerName: '',
    quantity: 1,
    unitPrice: 100,
  };
}

/**
 * Süreç yeniden başlatılmış gibi davranır: modül belleği sıfırlanır, MMKV'deki
 * kalıcı kopya yerinde kalır.
 */
function reloadAfterProcessRestart(): typeof import('./purchase-snapshot') {
  let reloaded!: typeof import('./purchase-snapshot');
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    reloaded = require('./purchase-snapshot');
  });
  return reloaded;
}

beforeEach(async () => {
  clearPurchaseSnapshot();
  await appStorage.removeItem('checkout.purchase-snapshot');
});

describe('purchase snapshot', () => {
  it('stores a copy of the submitted lines and returns them once', async () => {
    const items = [makeItem('1'), makeItem('2')];
    setPurchaseSnapshot(items);

    const consumed = await consumePurchaseSnapshot();
    expect(consumed).toHaveLength(2);
    expect(consumed?.[0]).not.toBe(items[0]);
    expect(consumed?.[0]).toEqual(items[0]);

    // Second consume must be empty so the purchase event cannot fire twice.
    expect(await consumePurchaseSnapshot()).toBeNull();
  });

  it('overwrites the previous snapshot on a new submit', async () => {
    setPurchaseSnapshot([makeItem('1')]);
    setPurchaseSnapshot([makeItem('2')]);

    expect((await consumePurchaseSnapshot())?.[0]?.productId).toBe('2');
  });

  it('clears without returning anything', async () => {
    setPurchaseSnapshot([makeItem('1')]);
    clearPurchaseSnapshot();
    expect(await consumePurchaseSnapshot()).toBeNull();
  });

  // Regresyon: 3DS sırasında (SMS kodu için uygulamadan çıkılır) Android süreci
  // öldürebiliyor. Snapshot yalnızca modül belleğinde tutulduğunda satırlar
  // kayboluyor, sunucu sepeti siparişle sildiği için yedek sepet de boş geliyor
  // ve satın alma eventi hiç atılmıyordu.
  it('survives a process restart through the persisted copy', async () => {
    setPurchaseSnapshot([makeItem('1'), makeItem('2')]);

    const reloaded = reloadAfterProcessRestart();

    const consumed = await reloaded.consumePurchaseSnapshot();
    expect(consumed?.map((item) => item.productId)).toEqual(['1', '2']);
    expect(await reloaded.consumePurchaseSnapshot()).toBeNull();
  });

  it('drops a persisted snapshot that is older than the max age', async () => {
    const stale = {
      savedAt: Date.now() - 7 * 60 * 60 * 1000,
      items: [makeItem('1')],
    };
    await appStorage.setItem('checkout.purchase-snapshot', JSON.stringify(stale));

    expect(await consumePurchaseSnapshot()).toBeNull();
  });

  it('ignores a corrupted persisted snapshot instead of throwing', async () => {
    await appStorage.setItem('checkout.purchase-snapshot', '{not json');

    expect(await consumePurchaseSnapshot()).toBeNull();
  });
});
