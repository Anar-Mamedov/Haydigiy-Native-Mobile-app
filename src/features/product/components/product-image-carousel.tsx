import { useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';

interface ProductImageCarouselProps {
  images: string[];
  onOpen: () => void;
  title: string;
  /** Notifies the parent of the currently visible image index (for deep-linking). */
  onIndexChange?: (index: number) => void;
}

export function ProductImageCarousel({ images, onOpen, title, onIndexChange }: ProductImageCarouselProps) {
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
            {images.map((img, idx) => (
              <Pressable
                key={idx}
                accessibilityLabel={`${title} ürün görseli`}
                accessibilityRole="button"
                onPress={onOpen}
                style={{ width: containerWidth, height: '100%' }}
              >
                <Image
                  contentFit="contain"
                  source={{ uri: img }}
                  style={{ height: '100%', width: '100%' }}
                />
              </Pressable>
            ))}
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
          <Image
            contentFit="contain"
            source={{ uri: images[0] }}
            style={{ height: '100%', width: '100%' }}
          />
        </Pressable>
      )}
    </YStack>
  );
}
