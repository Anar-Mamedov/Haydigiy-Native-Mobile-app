import { useState } from 'react';
import { GestureResponderEvent, Pressable } from 'react-native';
import { Heart, Play } from '@/components/ui/icons';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui/section-card';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { Product } from '@/types/product.types';
import { ProductFeatureAssetTicker, ProductFeatureDescriptionTicker } from './product-feature-tags';
import { ProductImageCarousel } from './product-image-carousel';
import { ProductCardPrice } from './product-price';
import { ProductSizeStrip } from './product-size-strip';
import { useToggleFavorite } from '@/features/favorite/api/favorite.queries';

type ProductCardProps = {
  /** Opens the product detail; receives the image index currently shown in the card. */
  onOpen: (imageIndex?: number) => void;
  onVideoPress?: (product: Product) => void;
  product: Product;
  onColorPress?: (product: Product) => void;
};

const PRODUCT_CARD_COLORS = {
  accent: BRAND_COLOR,
  danger: '#ef4444',
  emptyStar: '#d1d5db',
  favoriteInactive: '#9ca3af',
  textStrong: '#1f2937',
  white: '#ffffff',
} as const;

const CARD_SHADOW = '0 1px 2px rgba(0, 0, 0, 0.05)';
const FLOATING_SHADOW = '0 1px 4px rgba(0, 0, 0, 0.18)';
const FEATURE_ICON_SIZE = 60;

function stopPressPropagation(event?: GestureResponderEvent) {
  event?.stopPropagation?.();
}

function ColorChromaIcon() {
  return (
    <Svg width={16} height={10} viewBox="0 0 16 10" fill="none">
      <Path
        d="M8.91577 9.54621C9.55022 9.83756 10.2561 10 11 10C13.7614 10 16 7.76142 16 5C16 2.23858 13.7614 0 11 0C10.2561 0 9.55022 0.162441 8.91577 0.453786C10.1921 1.55408 11 3.18269 11 5C11 6.81731 10.1921 8.44592 8.91577 9.54621Z"
        fill="url(#colorChromaOuter)"
      />
      <Rect width={10} height={10} rx={5} fill="url(#colorChromaInner)" />
      <Defs>
        <LinearGradient id="colorChromaOuter" x1={8.91577} y1={10} x2={16} y2={10} gradientUnits="userSpaceOnUse">
          <Stop stopColor="#6BCEB4" />
          <Stop offset={0.519142} stopColor="#F98CC2" />
          <Stop offset={1} stopColor="#FFF781" />
        </LinearGradient>
        <LinearGradient id="colorChromaInner" x1={0} y1={10} x2={10} y2={10} gradientUnits="userSpaceOnUse">
          <Stop stopColor="#3023AE" />
          <Stop offset={0.519142} stopColor="#53A0FD" />
          <Stop offset={1} stopColor="#B4EC51" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

function RatingStar({ fillLevel }: { fillLevel: 'full' | 'half' | 'empty' }) {
  if (fillLevel === 'half') {
    return (
      <Svg width={12} height={12} viewBox="0 0 20 20">
        <Defs>
          <LinearGradient id="productCardHalfStar" x1={0} y1={0} x2={20} y2={0} gradientUnits="userSpaceOnUse">
            <Stop offset={0.5} stopColor="#facc15" />
            <Stop offset={0.5} stopColor={PRODUCT_CARD_COLORS.emptyStar} />
          </LinearGradient>
        </Defs>
        <Path
          fill="url(#productCardHalfStar)"
          d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
        />
      </Svg>
    );
  }

  return (
    <Svg width={12} height={12} viewBox="0 0 20 20">
      <Path
        fill={fillLevel === 'full' ? '#facc15' : PRODUCT_CARD_COLORS.emptyStar}
        d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
      />
    </Svg>
  );
}

function RatingStars({
  emptyStars,
  fullStars,
  hasHalfStar,
}: {
  emptyStars: number;
  fullStars: number;
  hasHalfStar: boolean;
}) {
  return (
    <XStack alignItems="center">
      {Array.from({ length: fullStars }).map((_, index) => (
        <RatingStar key={`full-${index}`} fillLevel="full" />
      ))}
      {hasHalfStar ? <RatingStar fillLevel="half" /> : null}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <RatingStar key={`empty-${index}`} fillLevel="empty" />
      ))}
    </XStack>
  );
}

export function ProductCard({ onOpen, onVideoPress, product, onColorPress }: ProductCardProps) {
  const { isFavorite, toggleFavorite: handleToggleFavorite } = useToggleFavorite(product);
  // Track the image currently shown in the card so the detail screen can open
  // on the same one.
  const [imageSelection, setImageSelection] = useState({
    productId: product.id,
    index: 0,
  });
  const imageIndex = imageSelection.productId === product.id ? imageSelection.index : 0;

  const ratingValue = product.rating ?? 0;
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 >= 0.5;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const hasCarousel = images.length > 1;
  const colorOptionsCount = product.otherColors?.length ?? 0;

  const handleVideoPress = (event?: GestureResponderEvent) => {
    stopPressPropagation(event);
    if (onVideoPress) {
      onVideoPress(product);
      return;
    }

    onOpen(imageIndex);
  };

  return (
    <SectionCard
      backgroundColor="$background"
      borderColor="$color4"
      borderRadius={8}
      borderWidth={1}
      boxShadow={CARD_SHADOW}
      flex={1}
      overflow="hidden"
      padding={0}
    >
      <YStack width="100%">
        <YStack width="100%" aspectRatio={2 / 3} backgroundColor="$color3" position="relative">
          <ProductImageCarousel
            key={product.id}
            images={images}
            onOpen={() => onOpen(imageIndex)}
            onIndexChange={(index) => setImageSelection({ productId: product.id, index })}
            productId={product.id}
            title={product.title}
          />

          <ProductFeatureAssetTicker
            featureIcons={product.featureIcons}
            height={FEATURE_ICON_SIZE}
            left={4}
            top={3}
            width={FEATURE_ICON_SIZE}
          />

          {/* Sold Out (Tükendi) Overlay Badge */}
          {product.hasStock === false && (
            <XStack
              position="absolute"
              top={4}
              left={4}
              backgroundColor={PRODUCT_CARD_COLORS.danger}
              paddingHorizontal={4}
              paddingVertical={2}
              borderRadius={4}
              zIndex={10}
            >
              <Paragraph color={PRODUCT_CARD_COLORS.white} fontSize={10} fontWeight="700">
                Tükendi
              </Paragraph>
            </XStack>
          )}

          {/* Video Play Button Overlay */}
          {product.videoPath ? (
            <Pressable
              accessibilityLabel={`${product.title} videosunu aç`}
              accessibilityRole="button"
              onPress={handleVideoPress}
              style={({ pressed }) => ({
                position: 'absolute',
                bottom: hasCarousel ? 32 : 8,
                left: 8,
                backgroundColor: PRODUCT_CARD_COLORS.accent,
                paddingLeft: 6,
                paddingRight: 10,
                paddingVertical: 4,
                borderRadius: 12,
                zIndex: 30,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                opacity: pressed ? 0.8 : 1,
                boxShadow: FLOATING_SHADOW,
              })}
            >
              <Play size={14} fill={PRODUCT_CARD_COLORS.white} color={PRODUCT_CARD_COLORS.white} />
              <Paragraph color={PRODUCT_CARD_COLORS.white} fontSize={11} fontWeight="600" letterSpacing={0}>
                VİDEO
              </Paragraph>
            </Pressable>
          ) : null}

          {colorOptionsCount > 0 && (
            <Pressable
              accessibilityLabel={`${product.title} renk seçeneklerini aç`}
              accessibilityRole="button"
              onPress={(e) => {
                stopPressPropagation(e);
                if (onColorPress) onColorPress(product);
              }}
              style={({ pressed }) => ({
                position: 'absolute',
                bottom: 24,
                right: 8,
                ...(colorOptionsCount > 1
                  ? { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }
                  : { height: 26, minWidth: 42, paddingHorizontal: 8, borderRadius: 13 }),
                backgroundColor: PRODUCT_CARD_COLORS.white,
                boxShadow: FLOATING_SHADOW,
                opacity: pressed ? 0.8 : 1,
                zIndex: 25,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <ColorChromaIcon />
              {colorOptionsCount > 1 && (
                <Paragraph color={PRODUCT_CARD_COLORS.textStrong} fontSize={12} fontWeight="500" marginLeft={4}>
                  {colorOptionsCount}
                </Paragraph>
              )}
            </Pressable>
          )}

          {/* Favorite Heart Button Overlay */}
          <Pressable
            accessibilityLabel={isFavorite ? `${product.title} favorilerden çıkar` : `${product.title} favorilere ekle`}
            accessibilityRole="button"
            onPress={(e) => {
              stopPressPropagation(e);
              handleToggleFavorite();
            }}
            style={({ pressed }) => ({
              position: 'absolute',
              top: 8,
              right: 8,
              padding: 6,
              backgroundColor: PRODUCT_CARD_COLORS.white,
              borderRadius: 100,
              boxShadow: FLOATING_SHADOW,
              opacity: pressed ? 0.8 : 1,
              zIndex: 25,
            })}
          >
            <Heart
              size={16}
              fill={isFavorite ? PRODUCT_CARD_COLORS.accent : 'transparent'}
              color={isFavorite ? PRODUCT_CARD_COLORS.accent : PRODUCT_CARD_COLORS.favoriteInactive}
            />
          </Pressable>
        </YStack>

        {/* Özellik/sıralama şeridi bilerek padding'li metin bloğunun DIŞINDA: şerit
            kartı kenardan kenara kaplamalı. İçeride negatif marjla taşırmak işe
            yaramıyor, çünkü `width="100%"` zaten padding'i dışlıyor ve şeridin
            `alignSelf="center"`i negatif marjı geri ortalayarak boşluğu geri getiriyor.
            `accessible={false}`: kartta ikinci bir "Ürün detayını aç" düğmesi
            duyurulmasın, ama şeride basınca yine detay açılsın. */}
        <Pressable accessible={false} onPress={() => onOpen(imageIndex)}>
          <ProductFeatureDescriptionTicker
            featureIcons={product.featureIcons}
            fontSize={11}
            lineHeight={15}
            numberOfLines={1}
            paddingHorizontal={8}
            paddingVertical={6}
            rankingText={product.rankingText}
          />
        </Pressable>

        {/* Text Content Padded Container */}
        <YStack padding={6} width="100%">
          <Pressable
            accessibilityLabel={`Ürün detayını aç: ${product.title}`}
            accessibilityRole="button"
            onPress={() => onOpen(imageIndex)}
          >
            <Paragraph color="$color10" fontSize={12} numberOfLines={1} marginBottom={2}>
              {product.category || product.brand || 'HaydiGiy'}
            </Paragraph>

            {/* Title */}
            <Paragraph fontWeight="500" fontSize={14} numberOfLines={2} minHeight={40} lineHeight={20} color="$color">
              {product.title}
            </Paragraph>

            {/* Star Rating & Review Count */}
            <XStack alignItems="center" marginTop={4} marginBottom={4}>
              <RatingStars fullStars={fullStars} hasHalfStar={hasHalfStar} emptyStars={emptyStars} />
              <Paragraph fontSize={12} color="$color10" marginLeft={4}>
                ({product.reviewCount ?? 0})
              </Paragraph>
            </XStack>
          </Pressable>

          {/* Beden listesi bilerek Pressable'ın dışında: yatay kaydırma hareketi
              kart basışıyla yarışmasın, kullanıcı ekrana sığmayan bedenleri
              kaydırarak görebilsin. */}
          <YStack marginVertical={4}>
            <ProductSizeStrip sizes={product.sizes} />
          </YStack>

          {/* Fiyat satırı: indirim varsa oran rozeti + üstü çizili eski fiyat */}
          <Pressable accessible={false} onPress={() => onOpen(imageIndex)}>
            <YStack marginTop={6} width="100%">
              <ProductCardPrice
                discountRate={product.discountRate}
                firstPrice={product.firstPrice}
                hasDiscount={product.hasDiscount}
                price={product.price}
                testID="product-card-price"
              />
            </YStack>
          </Pressable>
        </YStack>
      </YStack>
    </SectionCard>
  );
}
