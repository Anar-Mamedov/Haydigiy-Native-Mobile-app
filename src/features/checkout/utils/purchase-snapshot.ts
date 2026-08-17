import { appStorage } from '@/lib/storage/mmkv';
import { CartLineItem } from '@/types/cart.types';

/**
 * Sipariş gönderilirken sepet satırlarının kopyasını saklar. Ödeme başarı
 * ekranı açıldığında sepet çoktan invalidate edilmiş (boşalmış) olabileceği
 * için satın alma (Insider purchase) eventi bu anlık görüntüden beslenir.
 * `consume` tek seferliktir; aynı sipariş için mükerrer event üretilmez.
 *
 * Snapshot yalnızca bellekte tutulmaz, MMKV'ye de yazılır. 3D Secure sırasında
 * kullanıcı SMS kodu için uygulamadan çıkar; Android arka plandaki süreci
 * agresif şekilde öldürdüğü için dönüşte JS modül state'i sıfırlanmış olabilir.
 * O durumda sunucu sepeti siparişle birlikte sildiğinden yedek olarak okunan
 * sepet de boş gelir ve satın alma eventi hiç atılmazdı. Kalıcı kopya bu
 * senaryoyu kapatır. Satırlarda kart/kimlik verisi yoktur; MMKV doğru katman.
 */
const STORAGE_KEY = 'checkout.purchase-snapshot';

/**
 * Yarım kalan bir ödemenin satırları çok sonra açılan başka bir siparişe
 * iliştirilmesin diye snapshot bu süre sonunda geçersiz sayılır.
 */
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

type PersistedSnapshot = {
  savedAt: number;
  items: CartLineItem[];
};

let pendingItems: CartLineItem[] | null = null;

async function readPersisted(): Promise<CartLineItem[] | null> {
  try {
    const raw = await appStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedSnapshot;
    if (!Array.isArray(parsed?.items) || parsed.items.length === 0) return null;
    if (typeof parsed.savedAt !== 'number') return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;

    return parsed.items;
  } catch {
    // Bozuk/okunamayan kayıt analytics uğruna ödeme akışını kırmamalı.
    return null;
  }
}

async function removePersisted(): Promise<void> {
  try {
    await appStorage.removeItem(STORAGE_KEY);
  } catch {
    // Yoksayılır; bir sonraki `set` üzerine yazar, `MAX_AGE_MS` de eskitir.
  }
}

export function setPurchaseSnapshot(items: CartLineItem[]): void {
  const copies = items.map((item) => ({ ...item }));
  pendingItems = copies;

  try {
    const payload: PersistedSnapshot = { savedAt: Date.now(), items: copies };
    void appStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Kalıcı kopya en iyi çaba; bellekteki kopya ana yol olarak kalır.
  }
}

/**
 * Snapshot'ı tek seferlik okur. Bellekteki kopya varsa o kullanılır; süreç
 * yeniden başlatılmışsa kalıcı kopyaya düşülür.
 */
export async function consumePurchaseSnapshot(): Promise<CartLineItem[] | null> {
  const inMemory = pendingItems;
  pendingItems = null;

  const items = inMemory ?? (await readPersisted());
  await removePersisted();
  return items;
}

export function clearPurchaseSnapshot(): void {
  pendingItems = null;
  void removePersisted();
}
