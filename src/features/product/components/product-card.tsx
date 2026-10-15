import { useState } from 'react';
import { GestureResponderEvent, Pressable } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SecondaryPressArea } from '@/components/ui/secondary-press-area';
import { SectionCard } from '@/components/ui/section-card';
import { Product } from '@/types/product.types';
import { resolveBundleListingSavings } from '@/features/bundle/bundle.savings';
import { BundleSeparatePriceNote } from './bundle-separate-price-note';
import { CardFavoriteButton } from './card-favorite-button';
import { ProductCardColorButton, ProductCardVideoButton } from './product-card-media-buttons';
import { ProductFeatureAssetTicker, ProductFeatureDescriptionTicker } from './product-feature-tags';
import { ProductImageCarousel } from './product-image-carousel';
import { ProductCardPrice } from './product-price';
import { ProductSizeSpecialPrice } from './product-size-special-price';
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
  danger: '#ef4444',
  emptyStar: '#d1d5db',
  white: '#ffffff',
} as const;

const CARD_SHADOW = '0 1px 2px rgba(0, 0, 0, 0.05)';
const FEATURE_ICON_SIZE = 60;

function stopPressPropagation(event?: GestureResponderEvent) {
  event?.stopPropagation?.();
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

  // Paketin kazancı, indirimli kartlarla aynı satırda "-%X + yeşil fiyat" olarak gösterilir (web ile
  // aynı). Ayrı alım toplamı satırın altındaki notta durduğu için gri üstü çizili eski fiyat verilmez.
  const bundleSavings = resolveBundleListingSavings(product);
  const priceDiscount = bundleSavings
    ? { discountRate: bundleSavings.savingsPercent, firstPrice: undefined, hasDiscount: true }
    : { discountRate: product.discountRate, firstPrice: product.firstPrice, hasDiscount: product.hasDiscount };

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
      {/* Izgarada bir satırdaki kartlar en uzun karta gerilir. `flex={1}` bu
          fazladan yüksekliği kart içeriğine taşır ki metin bloğu aşağı
          yaslanabilsin; olmazsa artan boşluk fiyatın altında kalır. */}
      <YStack flex={1} testID="product-card-content" width="100%">
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
            <ProductCardVideoButton hasPager={hasCarousel} onPress={handleVideoPress} productTitle={product.title} />
          ) : null}

          {colorOptionsCount > 0 && (
            <ProductCardColorButton
              colorCount={colorOptionsCount}
              onPress={(e) => {
                stopPressPropagation(e);
                if (onColorPress) onColorPress(product);
              }}
              productTitle={product.title}
            />
          )}

          {/* Favorite Heart Button Overlay */}
          <CardFavoriteButton
            iconSize={16}
            isFavorite={isFavorite}
            onPress={(e) => {
              stopPressPropagation(e);
              handleToggleFavorite();
            }}
            productTitle={product.title}
          />
        </YStack>

        {/* Özellik/sıralama şeridi bilerek padding'li metin bloğunun DIŞINDA: şerit
            kartı kenardan kenara kaplamalı. İçeride negatif marjla taşırmak işe
            yaramıyor, çünkü `width="100%"` zaten padding'i dışlıyor ve şeridin
            `alignSelf="center"`i negatif marjı geri ortalayarak boşluğu geri getiriyor.
            `SecondaryPressArea`: kartta ikinci bir "Ürün detayını aç" düğmesi duyurulmasın ve
            27dp'lik şerit ayrı bir dokunma hedefi sayılmasın, ama şeride basınca yine detay açılsın. */}
        <SecondaryPressArea onPress={() => onOpen(imageIndex)}>
          <ProductFeatureDescriptionTicker
            featureIcons={product.featureIcons}
            fontSize={11}
            lineHeight={15}
            numberOfLines={1}
            paddingHorizontal={8}
            paddingVertical={6}
            rankingText={product.rankingText}
          />
        </SecondaryPressArea>

        {/* Metin bloğu kartın altına yaslanır (`marginTop="auto"`). Sıralama şeridi
            yalnızca bazı ürünlerde çıktığı için kartların metin blokları farklı
            yükseklikten başlıyor; alta yaslayınca yan yana duran iki kartın
            kategori/başlık/puan/beden/fiyat satırları karşı karşıya gelir ve artan
            boşluk fiyatın altında değil, görselle metinlerin arasında oluşur. */}
        <YStack marginTop="auto" padding={6} testID="product-card-text-block" width="100%">
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

          {/* Fiyat satırı: indirim varsa oran rozeti + üstü çizili eski fiyat; paketse altında ayrı alım
              toplamı; ucuz beden varsa altında duyurusu */}
          <SecondaryPressArea onPress={() => onOpen(imageIndex)}>
            <YStack gap={4} marginTop={6} width="100%">
              <ProductCardPrice
                discountRate={priceDiscount.discountRate}
                firstPrice={priceDiscount.firstPrice}
                hasDiscount={priceDiscount.hasDiscount}
                price={product.price}
                testID="product-card-price"
              />
              {bundleSavings ? <BundleSeparatePriceNote itemsTotal={bundleSavings.itemsTotal} /> : null}
              <ProductSizeSpecialPrice productPrice={product.price} sizes={product.sizes} />
            </YStack>
          </SecondaryPressArea>
        </YStack>
      </YStack>
    </SectionCard>
  );
}
