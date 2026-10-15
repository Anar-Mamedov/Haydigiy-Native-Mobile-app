import { useCallback, useState } from 'react';
import type { ImageLoadEventData } from 'expo-image';
import { AspectRatioCache, remoteImageAspectRatioCache } from '@/utils/image-aspect-ratio-cache';

type MeasuredRatio = {
  key: string;
  ratio: number;
};

type ImageAspectRatio = {
  /** Kutunun en/boy oranı: ölçülen, önbellekteki ya da varsayılan değer. */
  aspectRatio: number;
  /** expo-image `onLoad` işleyicisi; görselin gerçek oranını ölçüp önbelleğe yazar. */
  onLoad: (event: ImageLoadEventData) => void;
};

/**
 * Oranı bilinmeyen uzak görselin kutusunu boyutlandırır. Oranı expo-image `onLoad` ile ölçen her
 * görsel bu hook'u kullanmalı; `onLoad`'da doğrudan state güncellemek Android'de döngüye girer.
 *
 * Ölçüm görsel adresiyle birlikte saklanır: FlashList bir hücreyi başka bir banner için yeniden
 * kullandığında eski görselin oranı yeni görsele taşınmaz. Daha önce yüklenmiş görsel, yeniden
 * mount olduğunda oranını önbellekten alır ve ilk çizimde doğru boyda gelir.
 */
export function useImageAspectRatio(
  imageKey: string,
  fallbackRatio: number,
  cache: AspectRatioCache = remoteImageAspectRatioCache,
): ImageAspectRatio {
  const [measured, setMeasured] = useState<MeasuredRatio | null>(null);

  const aspectRatio =
    measured?.key === imageKey ? measured.ratio : (cache.get(imageKey) ?? fallbackRatio);

  const onLoad = useCallback(
    (event: ImageLoadEventData) => {
      // Android'de bildirilen boyut, kutuya göre küçültülüp decode edilen bitmap'in boyutudur ve
      // yuvarlanır. Oran her yüklemede güncellenirse kutu 1 px değişir, expo-image görseli yeni boyut
      // için yeniden yükler, o da biraz farklı bir oran bildirir: döngü durmaz (sürekli decode,
      // saniyede 60 kare çizim ve GPU'ya doku yüklemesi). Bu yüzden her görselin oranı bir kez ölçülür.
      if (cache.get(imageKey) !== undefined) return;

      const { width, height } = event.source;
      if (!width || !height) return;

      const ratio = width / height;
      cache.set(imageKey, ratio);
      setMeasured({ key: imageKey, ratio });
    },
    [cache, imageKey],
  );

  return { aspectRatio, onLoad };
}
