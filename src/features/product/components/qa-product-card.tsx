import { Image } from 'expo-image';
import { Info } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui/section-card';
import { QaProduct } from '../api/product-questions.mapper';
import { SocialTicker } from './social-ticker';

type QaProductCardProps = {
  product: QaProduct;
  onProductPress: () => void;
  onCriteriaPress: () => void;
};

/** Product summary header on the Q&A screen: image, name, price, criteria link. */
export function QaProductCard({ product, onProductPress, onCriteriaPress }: QaProductCardProps) {
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

          <XStack
            accessibilityLabel="Soru Sorma Kriterleri"
            accessibilityRole="button"
            alignItems="center"
            gap="$1"
            onPress={onCriteriaPress}
            pressStyle={{ opacity: 0.6 }}
          >
            <Info color="$color10" size={13} />
            <Paragraph color="$color10" fontSize={12}>
              Soru Sorma Kriterleri
            </Paragraph>
          </XStack>
        </YStack>
      </XStack>
    </SectionCard>
  );
}
