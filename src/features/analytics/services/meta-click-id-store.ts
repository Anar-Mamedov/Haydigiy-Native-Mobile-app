import { appStorage } from '@/lib/storage/mmkv';
import { buildFbc, extractFbclid } from '../utils/meta-click-id';

/**
 * Reklamdan gelen Meta tıklama kimliğinin cihazda saklanması (web `_fbc` çerezinin
 * native karşılığı). Pazarlama çerezi gibi yalnızca pazarlama onayıyla saklanır
 * (`useMetaClickIdCapture`), onay geri alınınca silinir (dispatcher `applyConsent`).
 *
 * Korelasyon kimliğidir, kimlik bilgisi değildir — bu yüzden MMKV (SecureStore değil).
 */

const STORAGE_KEY = 'analytics.meta-click-id';

/** Web `_fbc` çereziyle aynı ömür. */
export const META_CLICK_ID_TTL_MS = 90 * 24 * 60 * 60 * 1000;

type StoredClick = { fbclid: string; createdAt: number };

type ClickStorage = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

export type MetaClickIdStoreDependencies = {
  storage: ClickStorage;
  now: () => number;
};

export type MetaClickIdStore = {
  /** Açılış URL'sinde tıklama kimliği varsa saklar; yoksa hiçbir şey yapmaz. */
  capture(url: string): Promise<void>;
  /** Geçerli `fbc` değeri; kayıt yoksa ya da süresi dolduysa null. */
  getFbc(): Promise<string | null>;
  /** Saklanan kimliği siler (pazarlama onayı geri alındığında). */
  clear(): Promise<void>;
};

function parseStored(raw: string | null): StoredClick | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object') return null;
    const { fbclid, createdAt } = parsed as Partial<StoredClick>;
    return typeof fbclid === 'string' && fbclid !== '' && Number.isFinite(createdAt)
      ? { fbclid, createdAt: createdAt as number }
      : null;
  } catch {
    return null;
  }
}

const defaultDependencies: MetaClickIdStoreDependencies = {
  storage: appStorage,
  now: () => Date.now(),
};

export function createMetaClickIdStore(
  dependencies: MetaClickIdStoreDependencies = defaultDependencies,
): MetaClickIdStore {
  /** `undefined`: depo henüz okunmadı. */
  let cached: StoredClick | null | undefined;

  const load = async (): Promise<StoredClick | null> => {
    if (cached === undefined) {
      cached = parseStored(await dependencies.storage.getItem(STORAGE_KEY));
    }
    return cached;
  };

  return {
    async capture(url) {
      const fbclid = extractFbclid(url);
      if (!fbclid) return;

      // Aynı tıklamayla yeniden açılışta ilk görülme zamanı korunur; Meta bu zamanı bekler.
      const current = await load();
      if (current?.fbclid === fbclid) return;

      const next: StoredClick = { fbclid, createdAt: dependencies.now() };
      cached = next;
      await dependencies.storage.setItem(STORAGE_KEY, JSON.stringify(next));
    },

    async getFbc() {
      const current = await load();
      if (!current) return null;

      if (dependencies.now() - current.createdAt > META_CLICK_ID_TTL_MS) {
        cached = null;
        await dependencies.storage.removeItem(STORAGE_KEY);
        return null;
      }

      return buildFbc(current.fbclid, current.createdAt);
    },

    async clear() {
      cached = null;
      await dependencies.storage.removeItem(STORAGE_KEY);
    },
  };
}

export const metaClickIdStore = createMetaClickIdStore();
