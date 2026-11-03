import { XStack } from 'tamagui';
import { Star } from '@/components/ui/icons';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { BRAND_COLOR } from '@/lib/theme/colors';

export interface StarRatingInputProps {
  /** Seçili puan (1…max); seçilmediyse 0. */
  value: number;
  onChange: (value: number) => void;
  max?: number;
  accessibilityLabel: string;
  /** "5 üzerinden 3 puan" gibi her yıldızın okunacak adı. */
  getStarLabel?: (value: number, max: number) => string;
  disabled?: boolean;
  testID?: string;
}

/**
 * Paylaşılan yıldız puanı girişi. Her yıldız 48dp dokunma hedefidir; seçili yıldızlar marka rengiyle,
 * boşlar tema kenarlık rengiyle çizilir (açık/koyu temada görünür).
 */
export function StarRatingInput({
  value,
  onChange,
  max = 5,
  accessibilityLabel,
  getStarLabel = (star, total) => `${total} üzerinden ${star}`,
  disabled = false,
  testID,
}: StarRatingInputProps) {
  const stars = Array.from({ length: Math.max(1, Math.min(10, Math.round(max))) }, (_, index) => index + 1);

  return (
    <XStack accessibilityLabel={accessibilityLabel} accessibilityRole="radiogroup" flexWrap="wrap" testID={testID}>
      {stars.map((star) => {
        const filled = star <= value;
        return (
          <XStack
            accessibilityLabel={getStarLabel(star, stars.length)}
            accessibilityRole="radio"
            accessibilityState={{ checked: star === value, disabled }}
            alignItems="center"
            height={MIN_TOUCH_TARGET}
            justifyContent="center"
            key={star}
            onPress={() => {
              if (!disabled) onChange(star);
            }}
            opacity={disabled ? 0.6 : 1}
            testID={testID ? `${testID}-${star}` : undefined}
            width={MIN_TOUCH_TARGET}
          >
            {/* SVG `fill` tema token'ını çözmediği için merkezi marka sabiti kullanılır. */}
            <Star color={filled ? '$brand' : '$color8'} fill={filled ? BRAND_COLOR : 'transparent'} size={26} />
          </XStack>
        );
      })}
    </XStack>
  );
}
