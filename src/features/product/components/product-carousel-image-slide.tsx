import { Pressable } from 'react-native';
import { Image, type ImageTransition } from 'expo-image';
import { FeatureIcon } from '@/types/product.types';
import { ProductFeatureAssetTicker } from './product-feature-tags';

/** Orta boy görselden yüksek çözünürlüğe geçiş: web'deki `transition-opacity duration-300` karşılığı. */
export const HIGH_RES_FADE: ImageTransition = { duration: 300, effect: 'cross-dissolve' };

type ProductCarouselImageSlideProps = {
  /** Görselin, boş görseller süzüldükten sonraki sırası (tam ekran galeri bu sırayla açılır). */
  imageIndex: number;
  /** Asıl görsel; varsa yüksek çözünürlüklü sürüm. */
  uri: string;
  /** Asıl görsel yüklenene kadar gösterilen orta boy (liste) görseli. */
  placeholderUri?: string;
  width: number;
  height: number;
  featureIcons: FeatureIcon[];
  onPress?: (imageIndex: number) => void;
};

/**
 * Taşıyıcının tek görsel slaytı. Yer tutucu verildiğinde önce orta boy görsel (listeden önbellekte)
 * hemen çizilir, yüksek çözünürlüklü görsel yüklenince expo-image onun üstüne çapraz geçişle gelir;
 * iki görsel de aynı `contain` oturtmasıyla çizildiği için geçişte sıçrama olmaz.
 */
export function ProductCarouselImageSlide({
  imageIndex,
  uri,
  placeholderUri,
  width,
  height,
  featureIcons,
  onPress,
}: ProductCarouselImageSlideProps) {
  return (
    <Pressable
      accessibilityLabel={`${imageIndex + 1}. görseli tam ekranda aç`}
      accessibilityRole="button"
      disabled={!onPress}
      onPress={() => onPress?.(imageIndex)}
      style={{ width, height }}
    >
      <Image
        contentFit="contain"
        placeholder={placeholderUri ? { uri: placeholderUri } : undefined}
        placeholderContentFit="contain"
        source={{ uri }}
        style={{ width, height }}
        testID={`product-carousel-image-${imageIndex}`}
        transition={placeholderUri ? HIGH_RES_FADE : undefined}
      />
      <ProductFeatureAssetTicker featureIcons={featureIcons} />
    </Pressable>
  );
}
