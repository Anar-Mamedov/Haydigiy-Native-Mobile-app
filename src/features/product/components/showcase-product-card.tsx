import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Heart, ShoppingBag } from '@/components/ui/icons';
import { useFavoriteToggle } from '@/features/favorite/api/favorite.queries';
import { buildInsiderInput } from '@/features/insider/utils/insider-product.mapper';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { COMPACT_MAX_FONT_SCALE } from '@/lib/theme/font-scale';
import { ShowcaseProduct } from '../api/product-showcase.mapper';
import { ProductCardPrice } from './product-price';

type ShowcaseProductCardProps = {
  product: ShowcaseProduct;
  onPress: (product: ShowcaseProduct) => void;
  onAddToCartPress: (product: ShowcaseProduct) => void;
};

export const SHOWCASE_CARD_WIDTH = 148;

const CARD_SHADOW = '0 1px 2px rgba(0, 0, 0, 0.05)';
const FLOATING_SHADOW = '0 1px 4px rgba(0, 0, 0, 0.18)';
const FAVORITE_INACTIVE_COLOR = '#9ca3af';
const FAVORITE_BUTTON_BACKGROUND = '#ffffff';

type ShowcaseFavoriteButtonProps = {
  product: ShowcaseProduct;
};

/** Ürün listesindeki kartla aynı kalp düğmesi; vitrin ürününün kimliğiyle çalışır. */
function ShowcaseFavoriteButton({ product }: ShowcaseFavoriteButtonProps) {
  const buildTracking = useCallback(
    () =>
      buildInsiderInput({
        id: product.id,
        imageUrl: product.imageUrl ?? undefined,
        name: product.title,
        price: product.price,
        slug: product.slug || undefined,
      }),
    [product],
  );
  const { isFavorite, toggleFavorite } = useFavoriteToggle(product.id, buildTracking);

  return (
    <Pressable
      accessibilityLabel={isFavorite ? `${product.title} favorilerden çıkar` : `${product.title} favorilere ekle`}
      accessibilityRole="button"
      hitSlop={6}
      onPress={() => {
        void toggleFavorite();
      }}
      style={({ pressed }) => ({
        backgroundColor: FAVORITE_BUTTON_BACKGROUND,
        borderRadius: 100,
        boxShadow: FLOATING_SHADOW,
        opacity: pressed ? 0.8 : 1,
        padding: 6,
        position: 'absolute',
        right: 8,
        top: 8,
      })}
    >
      <Heart
        color={isFavorite ? BRAND_COLOR : FAVORITE_INACTIVE_COLOR}
        fill={isFavorite ? BRAND_COLOR : 'transparent'}
        size={14}
      />
    </Pressable>
  );
}

/** Ana sayfa vitrin kartı: görsel, favori, ad, fiyat ve "Sepete Ekle" (web `MobileProductShowcase`). */
export function ShowcaseProductCard({ product, onPress, onAddToCartPress }: ShowcaseProductCardProps) {
  return (
    <YStack
      backgroundColor="$background"
      borderColor="$color4"
      borderRadius={12}
      borderWidth={1}
      boxShadow={CARD_SHADOW}
      overflow="hidden"
      testID="showcase-product-card"
      width={SHOWCASE_CARD_WIDTH}
    >
      <YStack aspectRatio={2 / 3} backgroundColor="$color2" position="relative">
        <Pressable
          accessibilityLabel={`Ürün detayını aç: ${product.title}`}
          accessibilityRole="button"
          onPress={() => onPress(product)}
          style={{ flex: 1 }}
        >
          {product.imageUrl ? (
            <Image
              accessibilityLabel={`${product.title} görseli`}
              contentFit="contain"
              source={{ uri: product.imageUrl }}
              style={{ height: '100%', width: '100%' }}
            />
          ) : (
            <YStack alignItems="center" flex={1} justifyContent="center">
              <ShoppingBag color="$color8" size={28} />
            </YStack>
          )}
        </Pressable>

        {/* Favori API'si sayısal kimlik ister; yalnızca slug'ı olan üründe düğme yok. */}
        {product.id ? <ShowcaseFavoriteButton product={product} /> : null}
      </YStack>

      <YStack flex={1} gap={10} justifyContent="space-between" padding={10}>
        <Pressable accessible={false} onPress={() => onPress(product)}>
          <Paragraph color="$color" fontSize={12} fontWeight="600" lineHeight={16} minHeight={32} numberOfLines={2}>
            {product.title}
          </Paragraph>
          <YStack marginTop={6}>
            <ProductCardPrice
              discountRate={product.discountRate}
              firstPrice={product.firstPrice}
              hasDiscount={product.hasDiscount}
              maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
              price={product.price}
            />
          </YStack>
        </Pressable>

        <Button
          accessibilityLabel={`Sepete ekle: ${product.title}`}
          backgroundColor="$brand"
          borderRadius={8}
          borderWidth={0}
          height={30}
          onPress={() => onAddToCartPress(product)}
          paddingHorizontal={6}
          pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
          testID="showcase-add-to-cart"
        >
          <XStack alignItems="center" gap={4}>
            <ShoppingBag color="white" maxFontScale={COMPACT_MAX_FONT_SCALE} size={12} />
            <Paragraph
              color="white"
              fontSize={11}
              fontWeight="700"
              letterSpacing={0.4}
              maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
              numberOfLines={1}
            >
              SEPETE EKLE
            </Paragraph>
          </XStack>
        </Button>
      </YStack>
    </YStack>
  );
}
