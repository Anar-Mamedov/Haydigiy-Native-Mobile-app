import { useEffect, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView } from 'react-native';
import { Image } from 'expo-image';
import { ScrollView, XStack, YStack } from 'tamagui';
import { StoryContent } from '@/types/page-design.types';
import { handleLinkPress } from '@/utils/link-handler';

type HomeSliderSectionProps = {
  content: StoryContent;
};

export function HomeSliderSection({ content }: HomeSliderSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(300);
  const [aspectRatio, setAspectRatio] = useState<number>(1920 / 605); // default fallback aspect ratio matching web
  const scrollViewRef = useRef<RNScrollView>(null);
  const timerRef = useRef<any>(null);

  const items = content.items || [];

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
                  borderColor="rgb(150,152,156)"
                  borderRadius={15}
                  borderWidth={1}
                  height="100%"
                  overflow="hidden"
                  width="100%"
                >
                  <Image
                    contentFit="cover"
                    onLoad={(event) => {
                      if (index === 0) {
                        const { width: imgWidth, height: imgHeight } = event.source;
                        if (imgWidth && imgHeight) {
                          setAspectRatio(imgWidth / imgHeight);
                        }
                      }
                    }}
                    source={{ uri: imageUri }}
                    style={{
                      height: '100%',
                      width: '100%',
                    }}
                  />
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
