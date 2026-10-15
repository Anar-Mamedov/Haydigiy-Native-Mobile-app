import type { GestureResponderEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CornerChipButton } from '@/components/ui/corner-chip-button';
import { Play } from '@/components/ui/icons';

/** Görsel üstündeki çiplerin renkleri; ürün fotoğrafının üzerinde iki temada da aynı kalır. */
const CHIP_COLORS = {
  onBrand: '#ffffff',
  surface: '#ffffff',
  text: '#1f2937',
} as const;
const FLOATING_SHADOW = '0 1px 4px rgba(0, 0, 0, 0.18)';
/** Çiplerin kart görselinin yan kenarlarına uzaklığı. */
const CHIP_EDGE_INSET = 8;
/** Görselde birden çok fotoğraf varsa alttaki sayfa noktalarına yer kalsın diye VİDEO çipi yukarıda durur. */
const VIDEO_CHIP_BOTTOM_WITH_PAGER = 32;
const COLOR_CHIP_BOTTOM = 24;

type PressHandler = (event: GestureResponderEvent) => void;

function ColorChromaIcon() {
  return (
    <Svg width={16} height={10} viewBox="0 0 16 10" fill="none">
      <Path
        d="M8.91577 9.54621C9.55022 9.83756 10.2561 10 11 10C13.7614 10 16 7.76142 16 5C16 2.23858 13.7614 0 11 0C10.2561 0 9.55022 0.162441 8.91577 0.453786C10.1921 1.55408 11 3.18269 11 5C11 6.81731 10.1921 8.44592 8.91577 9.54621Z"
        fill="url(#colorChromaOuter)"
      />
      <Rect width={10} height={10} rx={5} fill="url(#colorChromaInner)" />
      <Defs>
        <LinearGradient id="colorChromaOuter" x1={8.91577} y1={10} x2={16} y2={10} gradientUnits="userSpaceOnUse">
          <Stop stopColor="#6BCEB4" />
          <Stop offset={0.519142} stopColor="#F98CC2" />
          <Stop offset={1} stopColor="#FFF781" />
        </LinearGradient>
        <LinearGradient id="colorChromaInner" x1={0} y1={10} x2={10} y2={10} gradientUnits="userSpaceOnUse">
          <Stop stopColor="#3023AE" />
          <Stop offset={0.519142} stopColor="#53A0FD" />
          <Stop offset={1} stopColor="#B4EC51" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

type ProductCardVideoButtonProps = {
  /** Görselde sayfa noktaları (birden çok fotoğraf) varsa çip onların üstüne çıkar. */
  hasPager: boolean;
  onPress: PressHandler;
  productTitle: string;
};

/**
 * Kart görselinin sol altındaki "VİDEO" çipi. Çip önceki yerinde ve boyutunda kalır; dokunma
 * alanı onu saran 48dp kutudur (çip tek başına ~22dp yüksekliğindeydi).
 */
export function ProductCardVideoButton({ hasPager, onPress, productTitle }: ProductCardVideoButtonProps) {
  return (
    <CornerChipButton
      accessibilityLabel={`${productTitle} videosunu aç`}
      corner="bottomLeft"
      offsetX={CHIP_EDGE_INSET}
      offsetY={hasPager ? VIDEO_CHIP_BOTTOM_WITH_PAGER : CHIP_EDGE_INSET}
      onPress={onPress}
      testID="product-card-video-button"
      zIndex={30}
    >
      <XStack
        alignItems="center"
        backgroundColor="$brand"
        borderRadius={12}
        boxShadow={FLOATING_SHADOW}
        gap={4}
        paddingLeft={6}
        paddingRight={10}
        paddingVertical={4}
      >
        <Play color={CHIP_COLORS.onBrand} fill={CHIP_COLORS.onBrand} size={14} />
        <Paragraph color={CHIP_COLORS.onBrand} fontSize={11} fontWeight="600" letterSpacing={0}>
          VİDEO
        </Paragraph>
      </XStack>
    </CornerChipButton>
  );
}

type ProductCardColorButtonProps = {
  /** Ürünün diğer renk sayısı; birden fazlaysa çipte sayı da yazar. */
  colorCount: number;
  onPress: PressHandler;
  productTitle: string;
};

/**
 * Kart görselinin sağ altındaki renk seçenekleri çipi. Çip önceki yerinde ve boyutunda kalır;
 * dokunma alanı onu saran 48dp kutudur (çip tek başına 43×26dp idi).
 */
export function ProductCardColorButton({ colorCount, onPress, productTitle }: ProductCardColorButtonProps) {
  const showsCount = colorCount > 1;

  return (
    <CornerChipButton
      accessibilityLabel={`${productTitle} renk seçeneklerini aç`}
      corner="bottomRight"
      offsetX={CHIP_EDGE_INSET}
      offsetY={COLOR_CHIP_BOTTOM}
      onPress={onPress}
      testID="product-card-color-button"
      zIndex={25}
    >
      <XStack
        alignItems="center"
        backgroundColor={CHIP_COLORS.surface}
        borderRadius={showsCount ? 12 : 13}
        boxShadow={FLOATING_SHADOW}
        height={showsCount ? undefined : 26}
        justifyContent="center"
        minWidth={showsCount ? undefined : 42}
        paddingHorizontal={8}
        paddingVertical={showsCount ? 2 : undefined}
      >
        <ColorChromaIcon />
        {showsCount && (
          <Paragraph color={CHIP_COLORS.text} fontSize={12} fontWeight="500" marginLeft={4}>
            {colorCount}
          </Paragraph>
        )}
      </XStack>
    </CornerChipButton>
  );
}
