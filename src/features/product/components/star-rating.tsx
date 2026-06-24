import { Star } from '@tamagui/lucide-icons-2';
import { XStack } from 'tamagui';
import { BRAND_COLOR } from '@/lib/theme/colors';

type StarRatingProps = {
  rating: number;
  size?: number;
};

/** Row of 5 stars, filled up to the (rounded) rating. */
export function StarRating({ rating, size = 14 }: StarRatingProps) {
  const rounded = Math.round(rating);
  return (
    <XStack alignItems="center" gap={2}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rounded;
        return (
          <Star
            color={filled ? '$brand' : '$color6'}
            fill={filled ? BRAND_COLOR : 'transparent'}
            key={star}
            size={size}
          />
        );
      })}
    </XStack>
  );
}
