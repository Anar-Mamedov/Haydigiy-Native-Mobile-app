/** Görsel adresine göre ölçülmüş en/boy oranını (genişlik / yükseklik) tutar. */
export type AspectRatioCache = {
  get: (key: string) => number | undefined;
  set: (key: string, ratio: number) => void;
};

const DEFAULT_MAX_ENTRIES = 300;

/**
 * Sınırlı boyutlu en/boy oranı önbelleği. Dolunca en eski kayıt atılır.
 *
 * Neden var: ana sayfa sanallaştırıldığı için ekrandan çıkan banner hücresi geri dönerken yeniden
 * mount olur. Oran bilinmezse hücre önce varsayılan oranla çizilir, görsel yüklenince boyu değişir;
 * hem sayfa zıplar hem de expo-image yeni boyut için görseli ikinci kez decode eder.
 */
export function createAspectRatioCache(maxEntries = DEFAULT_MAX_ENTRIES): AspectRatioCache {
  const ratios = new Map<string, number>();

  return {
    get: (key) => ratios.get(key),
    set: (key, ratio) => {
      if (!key || !Number.isFinite(ratio) || ratio <= 0) return;
      ratios.delete(key);
      ratios.set(key, ratio);
      if (ratios.size > maxEntries) {
        const oldestKey = ratios.keys().next().value;
        if (oldestKey !== undefined) ratios.delete(oldestKey);
      }
    },
  };
}

/**
 * Uzak görseller (ana sayfa banner'ları, blog yazı içi görselleri) için uygulama ömrü boyunca
 * paylaşılan önbellek. Anahtar görsel adresi olduğu için farklı ekranların kayıtları çakışmaz.
 */
export const remoteImageAspectRatioCache = createAspectRatioCache();
