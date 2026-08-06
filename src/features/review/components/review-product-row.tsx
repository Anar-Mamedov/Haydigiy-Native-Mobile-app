import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Star } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { WARNING_COLOR } from '@/lib/theme/colors';
import { ReviewTabKey, UserReview } from '@/types/review.types';

type ReviewProductRowProps = {
  review: UserReview;
  activeTab: ReviewTabKey;
  onReviewPress: (review: UserReview) => void;
  onProductPress: (slug: string) => void;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <XStack alignItems="center" gap="$1">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          color={WARNING_COLOR}
          fill={value <= Math.round(rating) ? WARNING_COLOR : 'transparent'}
          key={value}
          size={15}
        />
      ))}
      <Paragraph color="$color10" fontSize={12} marginLeft="$1">
        {rating}
      </Paragraph>
    </XStack>
  );
}

/** A reviewable / reviewed product row: thumbnail, details, rating and an action. */
export function ReviewProductRow({
  review,
  activeTab,
  onReviewPress,
  onProductPress,
}: ReviewProductRowProps) {
  const canReview = activeTab === 'pending' && !review.isReviewed;

  return (
    <XStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      gap="$3"
      padding="$3"
    >
      <Pressable
        accessibilityLabel={review.productName}
        accessibilityRole="imagebutton"
        onPress={() => onProductPress(review.slug)}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <YStack backgroundColor="$color3" borderRadius={6} height={100} overflow="hidden" width={80}>
          {review.productImage ? (
            <Image
              contentFit="cover"
              source={{ uri: review.productImage }}
              style={{ width: 80, height: 100 }}
            />
          ) : null}
        </YStack>
      </Pressable>

      <YStack flex={1} justifyContent="space-between">
        <YStack gap="$1.5">
          <Pressable
            accessibilityRole="button"
            onPress={() => onProductPress(review.slug)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Paragraph color="$color" fontSize={13} fontWeight="600" lineHeight={17} numberOfLines={2}>
              {review.productName}
              {review.variantName ? (
                <Paragraph color="$color10" fontSize={12}>
                  {'  '}({review.variantName})
                </Paragraph>
              ) : null}
            </Paragraph>
          </Pressable>

          {review.deliveredAt ? (
            <Paragraph color="$color10" fontSize={12}>
              Teslim Tarihi: {review.deliveredAt}
            </Paragraph>
          ) : null}

          {review.rating != null ? <StarRating rating={review.rating} /> : null}
        </YStack>

        <Pressable
          accessibilityLabel={canReview ? 'Ürünü değerlendir' : 'Değerlendirildi'}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canReview }}
          disabled={!canReview}
          onPress={() => onReviewPress(review)}
          style={({ pressed }) => ({ alignSelf: 'flex-start', opacity: pressed ? 0.7 : 1 })}
        >
          <XStack
            alignItems="center"
            borderColor={canReview ? '$brand' : '$borderColor'}
            borderRadius="$2"
            borderWidth={1}
            height={32}
            paddingHorizontal="$3"
          >
            <Paragraph
              color={canReview ? '$brand' : '$color9'}
              fontSize={12}
              fontWeight="600"
            >
              {canReview ? 'Ürünü Değerlendir' : 'Değerlendirildi'}
            </Paragraph>
          </XStack>
        </Pressable>
      </YStack>
    </XStack>
  );
}
