import { Image } from 'expo-image';
import { Info } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui/section-card';
import { ReviewProduct, ReviewSummary } from '../api/product-reviews.mapper';
import { SocialTicker } from './social-ticker';
import { StarRating } from './star-rating';

type ReviewProductCardProps = {
  product: ReviewProduct;
  summary: ReviewSummary;
  onProductPress: () => void;
  onCriteriaPress: () => void;
};

/** Product summary header on the reviews screen: image, name, price, rating. */
export function ReviewProductCard({
  product,
  summary,
  onProductPress,
  onCriteriaPress,
}: ReviewProductCardProps) {
  return (
    <SectionCard elevated>
      <XStack gap="$3">
        {product.imageUrl ? (
          <Image
            accessibilityRole="image"
            contentFit="cover"
            onTouchEnd={onProductPress}
            source={{ uri: product.imageUrl }}
            style={{ width: 100, height: 120, borderRadius: 8 }}
          />
        ) : null}

        <YStack flex={1} gap="$1.5" justifyContent="space-between">
          <YStack gap="$1">
            <Paragraph
              accessibilityRole="button"
              color="$color"
              fontSize={14}
              fontWeight="600"
              numberOfLines={2}
              onPress={onProductPress}
              pressStyle={{ opacity: 0.6 }}
            >
              {product.name}
            </Paragraph>
            {product.price ? (
              <Paragraph color="$brand" fontSize={20} fontWeight="800">
                {product.price} TL
              </Paragraph>
            ) : null}

            <SocialTicker
              cartCount={product.cartCount}
              favoritesCount={product.favoritesCount}
              totalQuantity={product.totalQuantity}
            />
          </YStack>

          <YStack gap="$1.5">
            <XStack alignItems="center" gap="$2">
              <Paragraph color="$brand" fontSize={17} fontWeight="800">
                {summary.average.toFixed(1)}
              </Paragraph>
              <StarRating rating={summary.average} size={15} />
            </XStack>
            <XStack
              accessibilityLabel="Yorum Yayınlama Kriterleri"
              accessibilityRole="button"
              alignItems="center"
              gap="$1"
              onPress={onCriteriaPress}
              pressStyle={{ opacity: 0.6 }}
            >
              <Info color="$color10" size={13} />
              <Paragraph color="$color10" fontSize={12}>
                Yorum Yayınlama Kriterleri
              </Paragraph>
            </XStack>
          </YStack>
        </YStack>
      </XStack>
    </SectionCard>
  );
}
