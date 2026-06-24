import { useState } from 'react';
import { Image } from 'expo-image';
import { ThumbsUp } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui/section-card';
import { ProductReviewItem } from '../api/product-reviews.mapper';
import { formatDateTR } from '../utils/format-date-tr';
import { StarRating } from './star-rating';

type ReviewCardProps = {
  review: ProductReviewItem;
  onPhotoPress?: () => void;
};

/** A single product review card mirroring the web mobile review item. */
export function ReviewCard({ review, onPhotoPress }: ReviewCardProps) {
  const [liked, setLiked] = useState(false);
  const likeCount = review.likeCount + (liked ? 1 : 0);

  return (
    <SectionCard elevated>
      <YStack gap="$2">
        <XStack alignItems="center" gap="$2" justifyContent="space-between">
          <XStack alignItems="center" flex={1} gap="$2">
            <StarRating rating={review.rating} size={13} />
            <Paragraph color="$color" fontSize={13} fontWeight="600" numberOfLines={1}>
              {review.userName}
            </Paragraph>
          </XStack>
          <Paragraph color="$color9" fontSize={11}>
            {formatDateTR(review.createdAt)}
          </Paragraph>
        </XStack>

        {review.comment ? (
          <Paragraph color="$color11" fontSize={13} lineHeight={19}>
            {review.comment}
          </Paragraph>
        ) : null}

        {review.photo ? (
          <Image
            accessibilityRole="imagebutton"
            contentFit="cover"
            onTouchEnd={onPhotoPress}
            source={{ uri: review.photo }}
            style={{ width: 80, height: 80, borderRadius: 8 }}
          />
        ) : null}

        <XStack flexWrap="wrap" gap="$3">
          {review.size ? (
            <Paragraph color="$color9" fontSize={11}>
              Beden: {review.size}
            </Paragraph>
          ) : null}
          {review.height ? (
            <Paragraph color="$color9" fontSize={11}>
              Boy: {review.height}cm
            </Paragraph>
          ) : null}
          {review.weight ? (
            <Paragraph color="$color9" fontSize={11}>
              Kilo: {review.weight}kg
            </Paragraph>
          ) : null}
        </XStack>

        <XStack
          accessibilityLabel="Bu değerlendirme faydalı"
          accessibilityRole="button"
          alignItems="center"
          alignSelf="flex-start"
          gap="$1"
          onPress={() => setLiked(true)}
          pressStyle={{ opacity: 0.6 }}
        >
          <ThumbsUp color={liked ? '$brand' : '$color9'} size={13} />
          <Paragraph color={liked ? '$brand' : '$color9'} fontSize={12}>
            ({likeCount})
          </Paragraph>
        </XStack>
      </YStack>
    </SectionCard>
  );
}
