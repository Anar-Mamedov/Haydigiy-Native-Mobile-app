import { Image } from 'expo-image';
import { ShoppingCart } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { AppButton, SectionCard } from '@/components/ui';
import { tokenValues } from '@/lib/theme/token-values';
import { Product } from '@/types/product.types';
import { formatCurrency } from '@/utils/format-currency';

type ProductCardProps = {
  onAddToCart: () => void;
  onOpen: () => void;
  product: Product;
};

export function ProductCard({ onAddToCart, onOpen, product }: ProductCardProps) {
  return (
    <SectionCard onPress={onOpen}>
      <YStack gap="$3">
        <Image
          contentFit="cover"
          source={{ uri: product.imageUrl }}
          style={{
            borderRadius: tokenValues.productImageRadius,
            height: tokenValues.productCardImageHeight,
            width: '100%',
          }}
        />
        <YStack gap="$2">
          <XStack alignItems="center" justifyContent="space-between">
            <Paragraph color="$color10" size="$2">
              {product.brand}
            </Paragraph>
            {product.badge ? (
              <Paragraph color="$color9" size="$2">
                {product.badge}
              </Paragraph>
            ) : null}
          </XStack>
          <Paragraph fontWeight="700" numberOfLines={2}>
            {product.title}
          </Paragraph>
          <Paragraph color="$color10" numberOfLines={2} size="$3">
            {product.shippingLabel}
          </Paragraph>
          <XStack alignItems="center" gap="$2">
            <Paragraph fontSize="$6" fontWeight="700">
              {formatCurrency(product.price)}
            </Paragraph>
            {product.originalPrice ? (
              <Paragraph color="$color10" textDecorationLine="line-through">
                {formatCurrency(product.originalPrice)}
              </Paragraph>
            ) : null}
          </XStack>
          <Paragraph color="$color10" size="$3">
            {product.rating.toFixed(1)} rating • {product.reviewCount} reviews
          </Paragraph>
          <AppButton icon={ShoppingCart} onPress={onAddToCart}>
            Add to cart
          </AppButton>
        </YStack>
      </YStack>
    </SectionCard>
  );
}
