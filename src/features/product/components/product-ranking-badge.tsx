import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ChevronRight, Trophy } from '@/components/ui/icons';
import { RANKING_BADGE_GRADIENT } from '@/lib/theme/colors';
import { COMPACT_MAX_FONT_SCALE } from '@/lib/theme/font-scale';

type ProductRankingBadgeProps = {
  /** "En Çok Satan 1. Ürün" (`ranking_text`). */
  text: string | null | undefined;
  /** Rozetin açtığı web listesi (`ranking_url`). */
  url: string | null | undefined;
  onPress: (url: string) => void;
};

const BADGE_HEIGHT = 30;

/**
 * Ürün detayındaki sıralama rozeti (web `MobileProductDetail` kupa rozeti):
 * dokununca ürünün sıralandığı popülerlik listesini açar. Metin ya da bağlantı
 * yoksa çizilmez; metin yine görsel üstündeki şeritte döner.
 */
export function ProductRankingBadge({ text, url, onPress }: ProductRankingBadgeProps) {
  const label = text?.trim();
  const target = url?.trim();
  if (!label || !target) return null;

  return (
    <Pressable
      accessibilityLabel={`${label} listesini görüntüle`}
      accessibilityRole="link"
      onPress={() => onPress(target)}
      style={{ alignSelf: 'flex-start', justifyContent: 'center', minHeight: 44 }}
      testID="product-ranking-badge"
    >
      {({ pressed }) => (
        <XStack
          alignItems="center"
          borderRadius={BADGE_HEIGHT / 2}
          gap={6}
          height={BADGE_HEIGHT}
          opacity={pressed ? 0.85 : 1}
          overflow="hidden"
          paddingHorizontal={12}
        >
          <LinearGradient
            colors={RANKING_BADGE_GRADIENT}
            end={{ x: 1, y: 0 }}
            start={{ x: 0, y: 0 }}
            style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
          />
          <Trophy color="white" size={14} />
          <Paragraph
            color="white"
            fontSize={12}
            fontWeight="700"
            maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
            numberOfLines={1}
          >
            {label}
          </Paragraph>
          <ChevronRight color="white" size={14} />
        </XStack>
      )}
    </Pressable>
  );
}
