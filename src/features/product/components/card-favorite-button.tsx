import type { GestureResponderEvent } from 'react-native';
import { YStack } from 'tamagui';
import { CornerChipButton } from '@/components/ui/corner-chip-button';
import { Heart } from '@/components/ui/icons';
import { BRAND_COLOR } from '@/lib/theme/colors';

/** Görsel üstündeki beyaz çip ve pasif kalp rengi; ürün fotoğrafının üzerinde iki temada da aynı kalır. */
const CHIP_BACKGROUND = '#ffffff';
const INACTIVE_HEART_COLOR = '#9ca3af';
const CHIP_SHADOW = '0 1px 4px rgba(0, 0, 0, 0.18)';
const CHIP_PADDING = 6;
/** Çipin kart görselinin köşesine uzaklığı. */
const CORNER_INSET = 8;

type CardFavoriteButtonProps = {
  isFavorite: boolean;
  /** Ekran okuyucu etiketinde kullanılan ürün adı. */
  productTitle: string;
  onPress: (event: GestureResponderEvent) => void;
  iconSize: number;
  testID?: string;
};

/**
 * Ürün kartı görselinin sağ üst köşesindeki favori kalbi. Beyaz çip köşeden 8dp içeride durur;
 * dokunma alanı köşedeki 48dp karedir (çip tek başına 26–28dp olduğu için dokunma hedefi
 * kontrolüne takılıyordu). Konumlandırma bileşenin kendisinde: kart görselinin içine konur.
 */
export function CardFavoriteButton({ iconSize, isFavorite, onPress, productTitle, testID }: CardFavoriteButtonProps) {
  return (
    <CornerChipButton
      accessibilityLabel={isFavorite ? `${productTitle} favorilerden çıkar` : `${productTitle} favorilere ekle`}
      accessibilityState={{ selected: isFavorite }}
      corner="topRight"
      offsetX={CORNER_INSET}
      offsetY={CORNER_INSET}
      onPress={onPress}
      testID={testID}
      zIndex={25}
    >
      <YStack backgroundColor={CHIP_BACKGROUND} borderRadius={100} boxShadow={CHIP_SHADOW} padding={CHIP_PADDING}>
        <Heart
          color={isFavorite ? BRAND_COLOR : INACTIVE_HEART_COLOR}
          fill={isFavorite ? BRAND_COLOR : 'transparent'}
          size={iconSize}
        />
      </YStack>
    </CornerChipButton>
  );
}
