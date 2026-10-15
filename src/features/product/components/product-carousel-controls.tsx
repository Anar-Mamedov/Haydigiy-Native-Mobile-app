import { ReactNode } from 'react';
import { XStack, YStack, useThemeName } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CornerChipButton } from '@/components/ui/corner-chip-button';
import { IconButton, MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { ChevronLeft, ChevronRight, Heart, Play, Share2 } from '@/components/ui/icons';
import { BRAND_COLOR } from '@/lib/theme/colors';

/** Görsel üstündeki yuvarlak aksiyon çipinin çapı; dokunma alanı onu saran 48dp kutudur. */
const FLOATING_ACTION_SIZE = 40;
const FLOATING_ACTION_ICON_SIZE = 20;
/** 40dp çipin 48dp kutu içinde her yandan kalan şeffaf payı. */
const FLOATING_ACTION_TOUCH_INSET = (MIN_TOUCH_TARGET - FLOATING_ACTION_SIZE) / 2;
/** Çiplerin görselin sağ üstüne uzaklığı (çipin kendisi, dokunma kutusu değil). */
const FLOATING_ACTIONS_TOP = 60;
const FLOATING_ACTIONS_RIGHT = 12;
const INACTIVE_ACTION_ICON_COLOR = '#6B7280';

/** Ok ikonunun görsel kenarına uzaklığı; ok 48dp kutunun bu kenarına yaslanır. */
const ARROW_EDGE_INSET = 4;
const ARROW_ICON_SIZE = 24;
const ARROW_ICON_COLOR = '#1F2937';

/** "VİDEO" çipinin görselin sol altına uzaklığı. */
const VIDEO_CHIP_LEFT = 16;
const VIDEO_CHIP_BOTTOM = 20;

function FloatingActionChip({ children }: { children: ReactNode }) {
  const themeName = useThemeName();
  const isDark = themeName === 'dark' || themeName.includes('dark');

  return (
    <YStack
      alignItems="center"
      backgroundColor={isDark ? '#1F2937' : 'white'}
      borderRadius={FLOATING_ACTION_SIZE / 2}
      elevation={5}
      height={FLOATING_ACTION_SIZE}
      justifyContent="center"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.15}
      shadowRadius={3.84}
      width={FLOATING_ACTION_SIZE}
    >
      {children}
    </YStack>
  );
}

type ProductCarouselFloatingActionsProps = {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
};

/**
 * Ürün görselinin sağ üstündeki favori ve paylaş butonları. 40dp beyaz çipler aynı yerde durur;
 * her birinin dokunma alanı çipi saran 48dp kutudur (çipler etiketsiz 40×40 olduğu için hem
 * dokunma hedefi hem etiket kontrolüne takılıyordu).
 */
export function ProductCarouselFloatingActions({
  isFavorite,
  onShare,
  onToggleFavorite,
}: ProductCarouselFloatingActionsProps) {
  return (
    <YStack
      // Kutular arası boşluk ($1.5) + iki yandaki şeffaf pay, çipler arasında önceki 12–13dp'yi korur.
      gap="$1.5"
      position="absolute"
      right={FLOATING_ACTIONS_RIGHT - FLOATING_ACTION_TOUCH_INSET}
      top={FLOATING_ACTIONS_TOP - FLOATING_ACTION_TOUCH_INSET}
      zIndex={10}
    >
      <IconButton
        accessibilityLabel={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        accessibilityState={{ selected: isFavorite }}
        onPress={onToggleFavorite}
        testID="product-carousel-favorite"
      >
        <FloatingActionChip>
          <Heart
            color={isFavorite ? '$brand' : INACTIVE_ACTION_ICON_COLOR}
            fill={isFavorite ? BRAND_COLOR : 'transparent'}
            size={FLOATING_ACTION_ICON_SIZE}
          />
        </FloatingActionChip>
      </IconButton>

      <IconButton accessibilityLabel="Ürünü paylaş" onPress={onShare} testID="product-carousel-share">
        <FloatingActionChip>
          <Share2 color={INACTIVE_ACTION_ICON_COLOR} size={FLOATING_ACTION_ICON_SIZE} />
        </FloatingActionChip>
      </IconButton>
    </YStack>
  );
}

type ProductCarouselArrowButtonProps = {
  direction: 'previous' | 'next';
  onPress: () => void;
};

/**
 * Görselin yanındaki önceki/sonraki oku. Ok önceki yerinde (kenardan 4dp) kalır; dokunma alanı
 * kenara yaslı 48dp kutudur (eskiden 24×40dp idi).
 */
export function ProductCarouselArrowButton({ direction, onPress }: ProductCarouselArrowButtonProps) {
  const isPrevious = direction === 'previous';
  const Icon = isPrevious ? ChevronLeft : ChevronRight;

  return (
    <YStack
      left={isPrevious ? 0 : undefined}
      marginTop={-MIN_TOUCH_TARGET / 2}
      position="absolute"
      right={isPrevious ? undefined : 0}
      top="50%"
      zIndex={10}
    >
      <IconButton
        accessibilityLabel={isPrevious ? 'Önceki görsel' : 'Sonraki görsel'}
        alignItems={isPrevious ? 'flex-start' : 'flex-end'}
        onPress={onPress}
        paddingLeft={isPrevious ? ARROW_EDGE_INSET : undefined}
        paddingRight={isPrevious ? undefined : ARROW_EDGE_INSET}
      >
        <Icon color={ARROW_ICON_COLOR} size={ARROW_ICON_SIZE} strokeWidth={2.5} />
      </IconButton>
    </YStack>
  );
}

/** Görselin sol altındaki "VİDEO" çipi; çip aynı yerde kalır, dokunma alanı 48dp kutudur. */
export function ProductCarouselVideoButton({ onPress }: { onPress: () => void }) {
  return (
    <CornerChipButton
      accessibilityLabel="Ürün videosunu oynat"
      corner="bottomLeft"
      offsetX={VIDEO_CHIP_LEFT}
      offsetY={VIDEO_CHIP_BOTTOM}
      onPress={onPress}
      zIndex={10}
    >
      <XStack
        alignItems="center"
        backgroundColor="$brand"
        borderRadius={20}
        elevation={5}
        gap={6}
        paddingLeft={10}
        paddingRight={14}
        paddingVertical={6}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={3.84}
      >
        <Play color="white" fill="white" size={12} />
        <Paragraph color="white" fontSize={11} fontWeight="700">
          VİDEO
        </Paragraph>
      </XStack>
    </CornerChipButton>
  );
}
