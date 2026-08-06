import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { YStack, XStack, Button } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Image } from 'expo-image';
import { X, ShoppingCart, TrendingDown } from '@/components/ui/icons';
import { FavoriteItem } from '@/types/favorite.types';
import { Product } from '@/types/product.types';
import { formatCurrency } from '@/utils/format-currency';
import { getFavoritePricing } from '../utils/favorite-pricing';

interface FavoriteCardProps {
  favorite: FavoriteItem;
  onRemovePress: (productId: string) => void;
  onAddToCartPress: (product: Product, size: string) => void;
  onOpenSizeSelector: (favorite: FavoriteItem) => void;
  selectedSize: string | null;
  onProductPress: (product: Product) => void;
}

export function FavoriteCard({
  favorite,
  onRemovePress,
  onAddToCartPress,
  onOpenSizeSelector,
  selectedSize,
  onProductPress,
}: FavoriteCardProps) {
  const { product } = favorite;
  const hasStock = product.hasStock ?? (product.variants?.some((v) => v.hasStock) || false);
  const isApprovedForSale = product.isApprovedForSale ?? true;

  const pricing = useMemo(() => getFavoritePricing(product), [product]);

  const handleProductClick = () => {
    onProductPress(product);
  };

  return (
    <YStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius={8}
      borderWidth={1}
      overflow="hidden"
      position="relative"
      flex={1}
      shadowColor="$shadowColor"
      shadowRadius={2}
      shadowOffset={{ width: 0, height: 1 }}
    >
      <Pressable
        accessibilityLabel={`${product.title} favorilerden kaldır`}
        accessibilityRole="button"
        onPress={() => onRemovePress(product.id)}
        style={({ pressed }) => ({
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 25,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <XStack
          width={26}
          height={26}
          borderRadius={100}
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
          alignItems="center"
          justifyContent="center"
          opacity={0.95}
          shadowColor="$shadowColor"
          shadowRadius={2}
          shadowOffset={{ width: 0, height: 1 }}
        >
          <X size={14} color="$color" />
        </XStack>
      </Pressable>

      <Pressable onPress={handleProductClick} style={{ width: '100%', aspectRatio: 2 / 3 }}>
        <YStack
          width="100%"
          height="100%"
          backgroundColor="$backgroundHover"
          padding="$2"
          position="relative"
        >
          <Image
            source={{ uri: product.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
            blurRadius={hasStock ? 0 : 6}
          />

          {pricing.isDiscounted && (
            <XStack
              position="absolute"
              top={8}
              left={8}
              backgroundColor="$brand"
              borderRadius={100}
              width={26}
              height={26}
              alignItems="center"
              justifyContent="center"
              zIndex={10}
              shadowColor="$shadowColor"
              shadowRadius={2}
              shadowOffset={{ width: 0, height: 1 }}
            >
              <TrendingDown size={14} color="white" strokeWidth={2.5} />
            </XStack>
          )}

          {!hasStock && (
            <YStack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="$shadowColor"
              alignItems="center"
              justifyContent="center"
              zIndex={10}
              pointerEvents="none"
            >
              <XStack
                backgroundColor="$background"
                opacity={0.9}
                paddingHorizontal="$2.5"
                paddingVertical="$1.5"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Paragraph color="$color" fontSize={10} fontWeight="700">
                  ÜRÜN TÜKENDİ
                </Paragraph>
              </XStack>
            </YStack>
          )}
        </YStack>
      </Pressable>

      <YStack padding="$3" flex={1}>
        <Paragraph
          fontSize={12}
          fontWeight="500"
          color="$color"
          numberOfLines={2}
          height={34}
          lineHeight={17}
          onPress={handleProductClick}
        >
          {product.title}
        </Paragraph>

        <XStack marginTop="$1.5" marginBottom="$2">
          <Paragraph fontSize={14} fontWeight="700" color="$brand">
            {formatCurrency(pricing.originalPrice)}
          </Paragraph>
        </XStack>

        {hasStock && (
          <XStack gap="$2" marginTop="auto" height={36}>
            {/* Pressable + XStack (not Tamagui Button) so $backgroundHover / $color
                resolve against the screen theme; a Button sub-theme made this text
                unreadable (dark-on-dark) in dark mode. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Beden seç"
              onPress={() => onOpenSizeSelector(favorite)}
              style={{ flex: 1 }}
            >
              {({ pressed }) => (
                <XStack
                  flex={1}
                  height={36}
                  backgroundColor="$backgroundHover"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$2"
                  paddingHorizontal="$2"
                  justifyContent="center"
                  alignItems="center"
                  opacity={pressed ? 0.85 : 1}
                >
                  <Paragraph fontSize={11} color="$color" numberOfLines={1}>
                    {selectedSize ? `Beden: ${selectedSize}` : 'Beden Seç'}
                  </Paragraph>
                </XStack>
              )}
            </Pressable>

            <Button
              height={36}
              width={36}
              backgroundColor={isApprovedForSale ? '$brand' : '$color4'}
              borderRadius="$2"
              padding={0}
              justifyContent="center"
              alignItems="center"
              disabled={!isApprovedForSale}
              onPress={() => {
                if (selectedSize) {
                  onAddToCartPress(product, selectedSize);
                } else {
                  onOpenSizeSelector(favorite);
                }
              }}
            >
              <ShoppingCart size={16} color="white" />
            </Button>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}
