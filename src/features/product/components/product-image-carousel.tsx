import { useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
} from 'react-native';
import { XStack, YStack } from 'tamagui';
import { ProductCardImage } from './product-card-image';

interface ProductImageCarouselProps {
  images: string[];
  onOpen: () => void;
  productId: string;
  title: string;
  /** Notifies the parent of the currently visible image index (for deep-linking). */
  onIndexChange?: (index: number) => void;
}

function getImageIdentity(productId: string, imageIndex: number, uri: string) {
  return `${productId}:${imageIndex}:${uri}`;
}

export function ProductImageCarousel({
  images,
  onOpen,
  productId,
  title,
  onIndexChange,
}: ProductImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const hasCarousel = images.length > 1;

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const viewportWidth = layoutMeasurement?.width || containerWidth;
    if (viewportWidth <= 0) return;
    const index = Math.round(contentOffset.x / viewportWidth);
    setActiveIndex(index);
    onIndexChange?.(index);
  };

  return (
    <YStack testID="product-image-carousel" width="100%" height="100%" onLayout={onContainerLayout}>
      {hasCarousel && containerWidth > 0 ? (
        <>
          <ScrollView
            testID="product-image-carousel-scroll"
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            style={{ width: '100%', height: '100%' }}
          >
            {images.map((img, idx) => {
              const imageIdentity = getImageIdentity(productId, idx, img);
              const shouldLoadImage = Math.abs(idx - activeIndex) <= 1;

              return (
                <Pressable
                  key={imageIdentity}
                  accessibilityLabel={`${title} ürün görseli`}
                  accessibilityRole="button"
                  onPress={onOpen}
                  style={{ width: containerWidth, height: '100%' }}
                >
                  {shouldLoadImage ? (
                    <ProductCardImage
                      imageIdentity={imageIdentity}
                      testID={`product-image-${idx}`}
                      title={title}
                      uri={img}
                    />
                  ) : (
                    <YStack
                      backgroundColor="$color3"
                      height="100%"
                      testID={`product-image-deferred-${idx}`}
                      width="100%"
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <XStack
            accessibilityLabel={`Görsel ${activeIndex + 1} / ${images.length}`}
            position="absolute"
            bottom={8}
            left={0}
            right={0}
            justifyContent="center"
            gap={8}
            zIndex={15}
          >
            {images.map((_, idx) => (
              <YStack
                key={idx}
                width={8}
                height={8}
                borderRadius={4}
                backgroundColor={activeIndex === idx ? '$brand' : 'rgba(255,255,255,0.6)'}
              />
            ))}
          </XStack>
        </>
      ) : (
        <Pressable
          accessibilityLabel={`${title} ürün görseli`}
          accessibilityRole="button"
          onPress={onOpen}
          style={{ flex: 1 }}
        >
          <ProductCardImage
            key={getImageIdentity(productId, 0, images[0])}
            imageIdentity={getImageIdentity(productId, 0, images[0])}
            testID="product-image-0"
            title={title}
            uri={images[0]}
          />
        </Pressable>
      )}
    </YStack>
  );
}
