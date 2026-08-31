import { appStorage } from '@/lib/storage/mmkv';

/**
 * Smart Recommender tıklama hafızası.
 *
 * Insider, öneri kampanyalarının **Add to Cart** ve **Revenue** istatistiklerini
 * yalnızca `clickSmartRecommendationProduct` ile aynı ürün kimliği kullanıldığında
 * eşleştirir; kimlik tutmazsa event panele hiç düşmez.
 *
 * Öneri kartındaki kimlik Insider feed'inden gelen `item_id`, sepet/sipariş
 * tarafındaki kimlik ise backend ürün kimliğidir. İkisinin eşit olduğu
 * varsayılıyordu ama hiçbir yerde garanti edilmiyordu. Bu modül tıklama anında
 * Insider'a gönderilen kimliği saklar; ürün daha sonra sepete eklendiğinde ya da
 * satın alındığında event **tıklamadaki kimlikle** gönderilir.
 *
 * Kayıt MMKV'ye de yazılır: 3D Secure sırasında kullanıcı uygulamadan çıkıyor ve
 * Android süreci öldürebiliyor. Bellek sıfırlanırsa satın alma eventi tıklamayla
 * eşleşemez ve gelir istatistiği kaybolurdu — `purchase-snapshot` ile aynı gerekçe.
 *
 * @see https://academy.insiderone.com/docs/react-native-smart-recommender#logger-for-statistics
 */

const STORAGE_KEY = 'insider.recommendation-clicks';

/**
 * Tıklamanın geçerli sayıldığı süre. Ödeme akışı 3DS ile uzayabildiği için
 * `purchase-snapshot` ile aynı pencere kullanılır; daha kısa bir süre satın alma
 * eventini tıklamasız bırakır.
 */
export const RECOMMENDATION_CLICK_TTL_MS = 6 * 60 * 60 * 1000;

/** Hafıza sınırsız büyümesin; en eski kayıtlar düşer. */
export const MAX_REMEMBERED_CLICKS = 20;

export type RecommendationClick = {
  /** Tıklama anında Insider'a gönderilen ürün kimliği (feed `item_id`). */
  productId: string;
  /** Ürünü sepet/sipariş tarafında tanımaya yarayan anahtarlar (kimlik, slug). */
  matchKeys: string[];
  /** Paneldeki kampanya kimliği. */
  recommendationId: number;
  clickedAt: number;
};

type PersistedClicks = {
  clicks: RecommendationClick[];
};

export interface RecommendationAttributionStore {
  /** Tıklamayı kaydeder; aynı ürün için önceki kayıt tazelenir. */
  remember(click: Omit<RecommendationClick, 'clickedAt'>): void;
  /** Anahtarlardan biri hatırlanan bir tıklamaya aitse o tıklamayı döner. */
  resolve(keys: (string | null | undefined)[]): RecommendationClick | null;
  /** Süreç yeniden başladığında kalıcı kopyayı belleğe alır. */
  restore(): Promise<void>;
  clear(): void;
}

interface AttributionDependencies {
  now: () => number;
  storage: {
    getItem: (key: string) => Promise<string | null> | string | null;
    removeItem: (key: string) => Promise<void> | void;
    setItem: (key: string, value: string) => Promise<void> | void;
  };
  ttlMs: number;
}

const defaultDependencies: AttributionDependencies = {
  now: () => Date.now(),
  storage: appStorage,
  ttlMs: RECOMMENDATION_CLICK_TTL_MS,
};

/** Boş/whitespace anahtarlar eşleşmeyi yanlış ürüne bağlayabilir; elenirler. */
function normalizeKeys(keys: (string | null | undefined)[]): string[] {
  const cleaned = keys
    .map((key) => (typeof key === 'string' ? key.trim() : ''))
    .filter(Boolean);

  return Array.from(new Set(cleaned));
}

function isPersistedClick(value: unknown): value is RecommendationClick {
  if (!value || typeof value !== 'object') return false;
  const click = value as Partial<RecommendationClick>;

  return (
    typeof click.productId === 'string' &&
    click.productId.trim() !== '' &&
    Array.isArray(click.matchKeys) &&
    typeof click.recommendationId === 'number' &&
    typeof click.clickedAt === 'number'
  );
}

export function createRecommendationAttributionStore(
  dependencies: AttributionDependencies = defaultDependencies,
): RecommendationAttributionStore {
  let clicks: RecommendationClick[] = [];

  const dropExpired = (): void => {
    const threshold = dependencies.now() - dependencies.ttlMs;
    clicks = clicks.filter((click) => click.clickedAt > threshold);
  };

  const persist = (): void => {
    try {
      const payload: PersistedClicks = { clicks };
      void dependencies.storage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Kalıcı kopya en iyi çaba; bellekteki liste ana yol olarak kalır.
    }
  };

  return {
    remember(click) {
      const productId = click.productId.trim();
      if (!productId) return;

      const matchKeys = normalizeKeys([...click.matchKeys, productId]);
      dropExpired();

      // Aynı ürüne tekrar tıklandıysa kayıt tazelenir, çoğaltılmaz.
      clicks = clicks.filter((existing) => existing.productId !== productId);
      clicks.push({
        clickedAt: dependencies.now(),
        matchKeys,
        productId,
        recommendationId: click.recommendationId,
      });

      if (clicks.length > MAX_REMEMBERED_CLICKS) {
        clicks = clicks.slice(clicks.length - MAX_REMEMBERED_CLICKS);
      }

      persist();
    },

    resolve(keys) {
      const candidates = normalizeKeys(keys);
      if (candidates.length === 0) return null;

      dropExpired();

      // En son tıklama önce denenir: aynı ürün iki kampanyadan gelmişse güncel olan kazanır.
      for (let index = clicks.length - 1; index >= 0; index -= 1) {
        const click = clicks[index];
        if (click.matchKeys.some((key) => candidates.includes(key))) return click;
      }

      return null;
    },

    async restore() {
      try {
        const raw = await dependencies.storage.getItem(STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw) as PersistedClicks;
        if (!Array.isArray(parsed?.clicks)) return;

        clicks = parsed.clicks.filter(isPersistedClick);
        dropExpired();
      } catch {
        // Bozuk kayıt analytics uğruna uygulamayı kırmamalı; hafıza boş başlar.
        clicks = [];
      }
    },

    clear() {
      clicks = [];
      try {
        void dependencies.storage.removeItem(STORAGE_KEY);
      } catch {
        // Yoksayılır; bir sonraki `remember` üzerine yazar, TTL de eskitir.
      }
    },
  };
}

export const recommendationAttributionStore = createRecommendationAttributionStore();
