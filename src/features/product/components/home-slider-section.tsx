import { useEffect, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, PixelRatio, ScrollView as RNScrollView } from 'react-native';
import { Image } from 'expo-image';
import { ScrollView, XStack, YStack } from 'tamagui';
import { useImageAspectRatio } from '@/components/ui/use-image-aspect-ratio';
import { StoryContent } from '@/types/page-design.types';
import { buildResizedCdnImageUrl } from '@/utils/cdn';
import { handleLinkPress } from '@/utils/link-handler';
import { isSlideInWindow } from '../utils/slide-window';

type HomeSliderSectionProps = {
  content: StoryContent;
};

/** Web ile aynı varsayılan oran; ilk slaydın görseli yüklenince gerçeğiyle değişir. */
const FALLBACK_SLIDER_ASPECT_RATIO = 1920 / 605;

export function HomeSliderSection({ content }: HomeSliderSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(300);
  const scrollViewRef = useRef<RNScrollView>(null);
  const timerRef = useRef<any>(null);

  const items = content.items || [];
  // Slider'ın yüksekliğini ilk slaydın görseli belirler (web ile aynı).
  const { aspectRatio, onLoad: onFirstSlideLoad } = useImageAspectRatio(
    items[0]?.image ?? '',
    FALLBACK_SLIDER_ASPECT_RATIO,
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / containerWidth);
    if (index >= 0 && index < items.length) {
      setActiveIndex(index);
    }
  };

  // Auto-play loop
  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % items.length;
          scrollViewRef.current?.scrollTo({
            animated: true,
            x: nextIndex * containerWidth,
          });
          return nextIndex;
        });
      }, 4000);
    };

    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [items.length, containerWidth]);

  if (items.length === 0) {
    return null;
  }

  const height = containerWidth / aspectRatio;
  const imagePixelWidth = PixelRatio.getPixelSizeForLayoutSize(containerWidth);

  return (
    <YStack
      gap="$2"
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      position="relative"
      width="100%"
    >
      <ScrollView
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={handleScroll}
        pagingEnabled
        ref={scrollViewRef as any}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        width="100%"
      >
        <XStack>
          {items.map((item, index) => {
            const imageUri = item.image;
            const targetLink = item.extra_link || item.link;
            // Etkin slayt ve komşuları dışındaki slaytlar çerçeve olarak kalır, bitmap tutmaz.
            const shouldMountImage = Boolean(imageUri) && isSlideInWindow(index, activeIndex, items.length);

            const handlePress = () => {
              handleLinkPress(targetLink);
            };

            return (
              <YStack
                accessibilityLabel={item.title || `Campaign banner ${index + 1}`}
                accessibilityRole="button"
                height={height}
                key={index}
                onPress={handlePress}
                paddingHorizontal="$2"
                pressStyle={{ opacity: 0.85 }}
                width={containerWidth}
              >
                <YStack
                  backgroundColor="$color2"
                  borderColor="rgb(150,152,156)"
                  borderRadius={15}
                  borderWidth={1}
                  height="100%"
                  overflow="hidden"
                  width="100%"
                >
                  {shouldMountImage ? (
                    <Image
                      contentFit="cover"
                      onLoad={index === 0 ? onFirstSlideLoad : undefined}
                      source={{ uri: buildResizedCdnImageUrl(imageUri, imagePixelWidth) ?? imageUri }}
                      style={{
                        height: '100%',
                        width: '100%',
                      }}
                      testID="home-slider-image"
                    />
                  ) : null}
                </YStack>
              </YStack>
            );
          })}
        </XStack>
      </ScrollView>

      {/* Slide Indicators */}
      {items.length > 1 ? (
        <XStack gap="$1.5" justifyContent="center" marginTop="$2" width="100%">
          {items.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <YStack
                backgroundColor={isActive ? '$brand' : '$borderColor'}
                borderRadius={isActive ? 6 : 4}
                height={8}
                key={index}
                width={isActive ? 16 : 8}
              />
            );
          })}
        </XStack>
      ) : null}
    </YStack>
  );
}
