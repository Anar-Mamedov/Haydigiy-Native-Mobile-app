import { Image } from 'expo-image';
import { ChevronRight } from '@/components/ui/icons';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui/section-card';
import { ProductReviewItem } from '../api/product-reviews.mapper';
import { formatDateTR } from '../utils/format-date-tr';
import { StarRating } from './star-rating';

type ReviewPhotoStripProps = {
  photoReviews: ProductReviewItem[];
  onPhotoPress: (index: number) => void;
};

/** "Fotoğraflı Değerlendirmeler" — horizontal photo strip with a featured preview. */
export function ReviewPhotoStrip({ photoReviews, onPhotoPress }: ReviewPhotoStripProps) {
  if (photoReviews.length === 0) return null;
  const featured = photoReviews[0];

  return (
    <YStack gap="$2.5">
      <XStack alignItems="center" justifyContent="space-between">
        <Paragraph color="$color" fontSize={15} fontWeight="700">
          Fotoğraflı Değerlendirmeler
        </Paragraph>
        <XStack
          accessibilityLabel="Tüm fotoğraflar"
          accessibilityRole="button"
          alignItems="center"
          gap="$1"
          onPress={() => onPhotoPress(0)}
          pressStyle={{ opacity: 0.6 }}
        >
          <Paragraph color="$brand" fontSize={13} fontWeight="600">
            Tümü
          </Paragraph>
          <ChevronRight color="$brand" size={15} />
        </XStack>
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {photoReviews.slice(0, 6).map((review, index) => (
          <Image
            accessibilityRole="imagebutton"
            contentFit="cover"
            key={review.id}
            onTouchEnd={() => onPhotoPress(index)}
            source={{ uri: review.photo ?? '' }}
            style={{ width: 100, height: 100, borderRadius: 8 }}
          />
        ))}
      </ScrollView>

      <SectionCard elevated padding="$3">
        <YStack gap="$1.5">
          <XStack alignItems="center" gap="$2">
            <StarRating rating={featured.rating} size={13} />
            <Paragraph color="$color10" fontSize={11}>
              {featured.userName}
            </Paragraph>
            <Paragraph color="$color9" fontSize={11}>
              {formatDateTR(featured.createdAt)}
            </Paragraph>
          </XStack>
          {featured.comment ? (
            <Paragraph color="$color11" fontSize={13} numberOfLines={2}>
              {featured.comment}
            </Paragraph>
          ) : null}
        </YStack>
      </SectionCard>
    </YStack>
  );
}
