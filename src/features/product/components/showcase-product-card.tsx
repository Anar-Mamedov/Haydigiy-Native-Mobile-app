import { useCallback } from 'react';
import { PixelRatio, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ShoppingBag } from '@/components/ui/icons';
import { useFavoriteToggle } from '@/features/favorite/api/favorite.queries';
import { buildInsiderInput } from '@/features/insider/utils/insider-product.mapper';
import { COMPACT_MAX_FONT_SCALE } from '@/lib/theme/font-scale';
import { selectProductImageVariant } from '@/utils/cdn';
import { ShowcaseProduct } from '../api/product-showcase.mapper';
import { CardFavoriteButton } from './card-favorite-button';
import { ProductCardPrice } from './product-price';

type ShowcaseProductCardProps = {
  product: ShowcaseProduct;
  onPress: (product: ShowcaseProduct) => void;
  onAddToCartPress: (product: ShowcaseProduct) => void;
};

export const SHOWCASE_CARD_WIDTH = 148;

const CARD_SHADOW = '0 1px 2px rgba(0, 0, 0, 0.05)';

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
    <CardFavoriteButton
      iconSize={14}
      isFavorite={isFavorite}
      onPress={() => {
        void toggleFavorite();
      }}
      productTitle={product.title}
      testID="showcase-favorite-button"
    />
  );
}

/** Ana sayfa vitrin kartı: görsel, favori, ad, fiyat ve "Sepete Ekle" (web `MobileProductShowcase`). */
export function ShowcaseProductCard({ product, onPress, onAddToCartPress }: ShowcaseProductCardProps) {
  // Kart genişliğini karşılayan en küçük hazır varyant (çoğu cihazda `medium`, düşük yoğunlukta `thumb`).
  const imageUri = selectProductImageVariant(
    product.imageUrl,
    PixelRatio.getPixelSizeForLayoutSize(SHOWCASE_CARD_WIDTH),
  );

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
          {imageUri ? (
            <Image
              accessibilityLabel={`${product.title} görseli`}
              contentFit="contain"
              recyclingKey={imageUri}
              source={{ uri: imageUri }}
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
