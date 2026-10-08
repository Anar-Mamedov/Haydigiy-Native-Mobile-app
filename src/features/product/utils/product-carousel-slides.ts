/** Ürün detay taşıyıcısındaki tek bir slayt: ürün görseli ya da sondaki ürün videosu. */
export type ProductCarouselSlide =
  | {
      key: string;
      type: 'image';
      imageIndex: number;
      /** Gösterilecek asıl görsel; varsa yüksek çözünürlüklü sürüm. */
      uri: string;
      /**
       * Asıl görsel yüklenene kadar gösterilen orta boy (liste) görseli. Yalnızca asıl görsel
       * ondan farklı bir yüksek çözünürlüklü sürüm olduğunda doludur.
       */
      placeholderUri?: string;
    }
  | {
      key: string;
      type: 'video';
      uri: string;
    };

/**
 * Taşıyıcının slaytlarını kurar. Her görsel slaytı, `highResImages` içinde aynı sıradaki yüksek
 * çözünürlüklü sürümü gösterir ve orta boy görseli yer tutucu olarak taşır; böylece liste görseli
 * hemen görünür, yüksek çözünürlük yüklenince üstüne yumuşakça geçilir (web `highResLoaded`).
 *
 * Slayt anahtarı orta boy görselden üretilir: önizleme → tam detay geçişinde yalnızca çözünürlük
 * değiştiğinde anahtar sabit kalır.
 */
export function getProductCarouselSlides(
  images: string[],
  videoPath?: string | null,
  highResImages?: string[],
): ProductCarouselSlide[] {
  const imageSlides: ProductCarouselSlide[] = images
    // Yüksek çözünürlüklü eşi, boş görseller süzülmeden önceki sırayla bulunur.
    .map((uri, sourceIndex) => ({ highResUri: highResImages?.[sourceIndex], uri }))
    .filter(({ uri }) => Boolean(uri))
    .map(({ highResUri, uri }, index) => {
      const hasHighRes = Boolean(highResUri) && highResUri !== uri;

      return {
        key: `image-${index}-${uri}`,
        type: 'image' as const,
        imageIndex: index,
        uri: hasHighRes ? (highResUri as string) : uri,
        placeholderUri: hasHighRes ? uri : undefined,
      };
    });

  if (!videoPath) {
    return imageSlides;
  }

  return [
    ...imageSlides,
    {
      key: `video-${videoPath}`,
      type: 'video' as const,
      uri: videoPath,
    },
  ];
}
