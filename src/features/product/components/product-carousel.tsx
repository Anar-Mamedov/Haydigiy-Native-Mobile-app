import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, NativeSyntheticEvent, NativeScrollEvent, Pressable, Share, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Heart, Share2, Play, ChevronLeft, ChevronRight } from '@tamagui/lucide-icons-2';
import { XStack, YStack, Paragraph, useThemeName } from 'tamagui';
import { tokenValues } from '@/lib/theme/token-values';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { FeatureIcon } from '@/types/product.types';
import { ProductCarouselVideoSlide } from './product-carousel-video-slide';

interface ProductCarouselProps {
  images: string[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onVideoPress?: (videoUri: string) => void;
  /** Product code shown on the image badge — kept in sync with the title code. */
  productCode?: string;
  videoPath?: string | null;
  productTitle?: string;
  productSlug?: string;
  featureIcons?: FeatureIcon[];
}

type ProductCarouselSlide =
  | {
      key: string;
      type: 'image';
      uri: string;
    }
  | {
      key: string;
      type: 'video';
      uri: string;
    };

function getFeatureIconPosition(positionHint?: string) {
  switch (positionHint) {
    case 'top-left':
      return { top: 12, left: 12 };
    case 'top-right':
      return { top: 12, right: 12 };
    case 'bottom-left':
      return { bottom: 12, left: 12 };
    case 'bottom-right':
      return { bottom: 12, right: 12 };
    default:
      return { top: 12, left: 12 };
  }
}

function getLoopedIndex(index: number, total: number) {
  if (total <= 0) return 0;

  return ((index % total) + total) % total;
}

function getProductCarouselSlides(images: string[], videoPath?: string | null): ProductCarouselSlide[] {
  const imageSlides = images
    .filter((uri) => Boolean(uri))
    .map((uri, index) => ({
      key: `image-${index}-${uri}`,
      type: 'image' as const,
      uri,
    }));

  if (!videoPath) {
    return imageSlides;
  }

  return [
    ...imageSlides,
    {
      key: `video-${videoPath}`,
      type: 'video' as const,
      uri: videoPath,
    },
  ];
}

function ProductFeatureIconOverlay({ featureIcons }: { featureIcons?: FeatureIcon[] }) {
  if (!featureIcons || featureIcons.length === 0) return null;

  return (
    <XStack position="absolute" top={0} left={0} right={0} bottom={0} pointerEvents="none" zIndex={10}>
      {[...featureIcons]
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map((icon) => {
          const positionStyle = getFeatureIconPosition(icon.positionHint || (icon.position as any));
          return (
            <XStack key={icon.id} position="absolute" style={positionStyle}>
              <Image
                source={{ uri: icon.assetUrl }}
                style={{ width: 76, height: 56 }}
                contentFit="contain"
              />
            </XStack>
          );
        })}
    </XStack>
  );
}

export function ProductCarousel({
  images = [],
  isFavorite,
  onToggleFavorite,
  onVideoPress,
  productCode,
  videoPath,
  productTitle = '',
  productSlug = '',
  featureIcons = [],
}: ProductCarouselProps) {
  const listRef = useRef<FlatList<ProductCarouselSlide>>(null);
  const { width: screenWidth } = useWindowDimensions();
  const themeName = useThemeName();
  const isDark = themeName === 'dark' || themeName.includes('dark');
  const slides = useMemo(() => getProductCarouselSlides(images, videoPath), [images, videoPath]);
  const slideCount = slides.length;
  const videoSlideIndex = slides.findIndex((slide) => slide.type === 'video');
  const hasVideoSlide = videoSlideIndex >= 0;
  const hasLoop = slideCount > 1;
  const initialVirtualIndex = hasLoop ? 1 : 0;
  const slideResetKey = `${slides[0]?.key ?? ''}|${slides[slideCount - 1]?.key ?? ''}|${slideCount}`;
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeVirtualIndex, setActiveVirtualIndex] = useState(initialVirtualIndex);
  const [videoAutoplayRequest, setVideoAutoplayRequest] = useState(0);
  const itemWidth = Math.max(screenWidth - 64, 1);
  const carouselHeight = itemWidth * 1.5; // Exactly 2:3 aspect ratio
  const carouselSlides = useMemo(
    () => (hasLoop ? [slides[slideCount - 1], ...slides, slides[0]] : slides),
    [hasLoop, slideCount, slides],
  );

  const scrollToVirtualIndex = (virtualIndex: number, animated = true) => {
    listRef.current?.scrollToOffset({ offset: virtualIndex * itemWidth, animated });
  };

  useEffect(() => {
    if (slideCount === 0) return;

    setActiveIndex(0);
    setActiveVirtualIndex(initialVirtualIndex);
    scrollToVirtualIndex(initialVirtualIndex, false);
  }, [initialVirtualIndex, itemWidth, slideResetKey]);

  const resolveLogicalIndex = (virtualIndex: number) => {
    if (slideCount === 0) {
      return 0;
    }

    if (!hasLoop) {
      return Math.max(0, Math.min(virtualIndex, slideCount - 1));
    }

    return getLoopedIndex(virtualIndex - 1, slideCount);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const virtualIndex = Math.round(scrollPosition / itemWidth);
    setActiveVirtualIndex(virtualIndex);
    setActiveIndex(resolveLogicalIndex(virtualIndex));
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const virtualIndex = Math.round(scrollPosition / itemWidth);

    setActiveIndex(resolveLogicalIndex(virtualIndex));
    setActiveVirtualIndex(virtualIndex);

    if (!hasLoop) return;

    if (virtualIndex === 0) {
      setActiveVirtualIndex(slideCount);
      requestAnimationFrame(() => scrollToVirtualIndex(slideCount, false));
      return;
    }

    if (virtualIndex === slideCount + 1) {
      setActiveVirtualIndex(1);
      requestAnimationFrame(() => scrollToVirtualIndex(1, false));
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${productTitle}\nhttps://haydigiy.com/product/${productSlug}`,
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  const scrollPrev = () => {
    if (!hasLoop) return;

    const nextIndex = getLoopedIndex(activeIndex - 1, slideCount);
    const virtualIndex = activeIndex === 0 ? 0 : activeIndex;

    scrollToVirtualIndex(virtualIndex);
    setActiveIndex(nextIndex);
    setActiveVirtualIndex(virtualIndex);
  };

  const scrollNext = () => {
    if (!hasLoop) return;

    const nextIndex = getLoopedIndex(activeIndex + 1, slideCount);
    const virtualIndex = activeIndex === slideCount - 1 ? slideCount + 1 : activeIndex + 2;

    scrollToVirtualIndex(virtualIndex);
    setActiveIndex(nextIndex);
    setActiveVirtualIndex(virtualIndex);
  };

  const scrollToVideoSlide = () => {
    if (!hasVideoSlide) return;

    if (onVideoPress && videoPath) {
      onVideoPress(videoPath);
      return;
    }

    const virtualIndex = hasLoop ? videoSlideIndex + 1 : videoSlideIndex;

    scrollToVirtualIndex(virtualIndex);
    setActiveIndex(videoSlideIndex);
    setActiveVirtualIndex(virtualIndex);
    setVideoAutoplayRequest((request) => request + 1);
  };

  return (
    <YStack width="100%" position="relative" backgroundColor={isDark ? '#111827' : 'white'} paddingHorizontal={32}>
      {/* Slide Carousel Container (fixed 2:3 height) */}
      <YStack width="100%" height={carouselHeight} position="relative">
        {/* Horizontal Paged List with Snap Interval */}
        <FlatList
          testID="product-carousel-list"
          ref={listRef}
          data={carouselSlides}
          horizontal
          initialScrollIndex={hasLoop ? 1 : undefined}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          keyExtractor={(item, index) => `${item}-${index}`}
          getItemLayout={(_, index) => ({
            length: itemWidth,
            offset: itemWidth * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <YStack width={itemWidth} height={carouselHeight} position="relative">
              {item.type === 'video' ? (
                <ProductCarouselVideoSlide
                  autoplayRequest={videoAutoplayRequest}
                  height={carouselHeight}
                  isActive={index === activeVirtualIndex}
                  onOpenPress={onVideoPress ? () => onVideoPress(item.uri) : undefined}
                  uri={item.uri}
                  width={itemWidth}
                />
              ) : (
                <>
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: itemWidth, height: carouselHeight }}
                    contentFit="contain"
                  />
                  <ProductFeatureIconOverlay featureIcons={featureIcons} />
                </>
              )}
            </YStack>
          )}
        />

        {/* Code tag (top right) */}
        {productCode ? (
          <XStack
            position="absolute"
            top={12}
            right={12}
            backgroundColor={isDark ? 'rgba(0,0,0,0.7)' : 'rgba(31, 41, 55, 0.8)'}
            paddingHorizontal={8}
            paddingVertical={4}
            borderRadius={4}
            zIndex={10}
          >
            <Paragraph color="white" fontSize={11} fontWeight="700">
              {productCode}
            </Paragraph>
          </XStack>
        ) : null}

        {/* Floating actions: Favorite (heart) and Share */}
        <YStack position="absolute" top={60} right={12} gap="$3" zIndex={10}>
          <Pressable
            onPress={onToggleFavorite}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? '#1F2937' : 'white',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.84,
              elevation: 5,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Heart
              size={20}
              fill={isFavorite ? BRAND_COLOR : 'transparent'}
              color={isFavorite ? '$brand' : '#6B7280'}
            />
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? '#1F2937' : 'white',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3.84,
              elevation: 5,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Share2 size={20} color="#6B7280" />
          </Pressable>
        </YStack>

        {/* Left Chevron Overlay (Placed in padding area) */}
        {hasLoop && (
          <Pressable
            onPress={scrollPrev}
            accessibilityRole="button"
            accessibilityLabel="Önceki görsel"
            style={({ pressed }) => ({
              position: 'absolute',
              left: 4,
              top: '50%',
              marginTop: -20,
              width: 24,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <ChevronLeft size={24} color="#1F2937" strokeWidth={2.5} />
          </Pressable>
        )}

        {/* Right Chevron Overlay (Placed in padding area) */}
        {hasLoop && (
          <Pressable
            onPress={scrollNext}
            accessibilityRole="button"
            accessibilityLabel="Sonraki görsel"
            style={({ pressed }) => ({
              position: 'absolute',
              right: 4,
              top: '50%',
              marginTop: -20,
              width: 24,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <ChevronRight size={24} color="#1F2937" strokeWidth={2.5} />
          </Pressable>
        )}

        {/* Video button (bottom left) */}
        {hasVideoSlide && activeIndex !== videoSlideIndex && (
          <Pressable
            onPress={scrollToVideoSlide}
            accessibilityRole="button"
            accessibilityLabel="Ürün videosunu oynat"
            style={({ pressed }) => ({
              position: 'absolute',
              bottom: 20,
              left: 16,
              backgroundColor: BRAND_COLOR,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingLeft: 10,
              paddingRight: 14,
              paddingVertical: 6,
              borderRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              zIndex: 10,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Play size={12} fill="white" color="white" />
            <Paragraph color="white" fontSize={11} fontWeight="700">
              VİDEO
            </Paragraph>
          </Pressable>
        )}

        {/* Active Dot Indicators */}
        {hasLoop && (
          <XStack
            accessibilityLabel={`Slayt ${activeIndex + 1} / ${slideCount}`}
            position="absolute"
            bottom={20}
            alignSelf="center"
            gap={6}
            zIndex={10}
          >
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <YStack
                  key={slide.key}
                  width={isActive ? 8 : 6}
                  height={isActive ? 8 : 6}
                  borderRadius={isActive ? 4 : 3}
                  backgroundColor={isActive ? '$brand' : isDark ? '#4B5563' : '#D1D5DB'}
                  opacity={isActive ? 1 : 0.8}
                />
              );
            })}
          </XStack>
        )}
      </YStack>

      {/* Orange feature icon descriptions bar - stretched to full screen width */}
      {featureIcons && featureIcons.some((icon) => icon.description) && (
        <XStack
          backgroundColor="$brand"
          paddingVertical={10}
          paddingHorizontal={16}
          justifyContent="center"
          alignItems="center"
          width={screenWidth}
          marginHorizontal={-32}
          alignSelf="center"
        >
          <Paragraph color="white" fontSize={13} fontWeight="700" textAlign="center" lineHeight={18}>
            {featureIcons
              .filter((icon) => icon.description)
              .map((icon) => icon.description)
              .join(' • ')}
          </Paragraph>
        </XStack>
      )}
    </YStack>
  );
}
