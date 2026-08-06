import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, NativeSyntheticEvent, NativeScrollEvent, Pressable, Share, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Heart, Share2, Play, ChevronLeft, ChevronRight } from '@/components/ui/icons';
import { XStack, YStack, useThemeName } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { FeatureIcon } from '@/types/product.types';
import { ProductCarouselVideoSlide } from './product-carousel-video-slide';
import { ProductFeatureAssetTicker, ProductFeatureDescriptionTicker } from './product-feature-tags';
import {
  CAROUSEL_HORIZONTAL_PADDING,
  getCarouselImageHeight,
  getCarouselItemWidth,
} from '../utils/product-carousel-geometry';

interface ProductCarouselProps {
  images: string[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onVideoPress?: (videoUri: string) => void;
  videoPath?: string | null;
  productTitle?: string;
  productSlug?: string;
  featureIcons?: FeatureIcon[];
  onImagePress?: (imageIndex: number) => void;
  /** Image index the carousel should open on (e.g. the one shown in the list card). */
  initialIndex?: number;
}

type ProductCarouselSlide =
  | {
      key: string;
      type: 'image';
      imageIndex: number;
      uri: string;
    }
  | {
      key: string;
      type: 'video';
      uri: string;
    };

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
      imageIndex: index,
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

export function ProductCarousel({
  images = [],
  isFavorite,
  onToggleFavorite,
  onVideoPress,
  videoPath,
  productTitle = '',
  productSlug = '',
  featureIcons = [],
  onImagePress,
  initialIndex = 0,
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
  // Clamp the requested initial index to the available image slides so we never
  // try to open on (or past) the trailing video slide.
  const imageSlideCount = slides.filter((slide) => slide.type === 'image').length;
  const clampedInitialIndex = Math.min(Math.max(initialIndex, 0), Math.max(imageSlideCount - 1, 0));
  const initialVirtualIndex = hasLoop ? clampedInitialIndex + 1 : clampedInitialIndex;
  const slideResetKey = `${slides[0]?.key ?? ''}|${slides[slideCount - 1]?.key ?? ''}|${slideCount}`;
  const [activeIndex, setActiveIndex] = useState(clampedInitialIndex);
  const [activeVirtualIndex, setActiveVirtualIndex] = useState(initialVirtualIndex);
  const [videoAutoplayRequest, setVideoAutoplayRequest] = useState(0);
  const itemWidth = getCarouselItemWidth(screenWidth);
  const carouselHeight = getCarouselImageHeight(screenWidth); // Exactly 2:3 aspect ratio
  const carouselSlides = useMemo(
    () => (hasLoop ? [slides[slideCount - 1], ...slides, slides[0]] : slides),
    [hasLoop, slideCount, slides],
  );

  const scrollToVirtualIndex = useCallback((virtualIndex: number, animated = true) => {
    listRef.current?.scrollToOffset({ offset: virtualIndex * itemWidth, animated });
  }, [itemWidth]);

  useEffect(() => {
    if (slideCount === 0) return;

    setActiveIndex(clampedInitialIndex);
    setActiveVirtualIndex(initialVirtualIndex);
    // Defer the scroll until after the FlatList has committed the new slide
    // data. A synchronous scrollToOffset right after the slide set changes
    // (e.g. preview image → full images + video) can be dropped, leaving the
    // list parked on the cloned last slide (the video) at offset 0.
    const raf = requestAnimationFrame(() => scrollToVirtualIndex(initialVirtualIndex, false));
    return () => cancelAnimationFrame(raf);
  }, [clampedInitialIndex, initialVirtualIndex, scrollToVirtualIndex, slideCount, slideResetKey]);

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
    <YStack width="100%" position="relative" backgroundColor={isDark ? '#111827' : 'white'} paddingHorizontal={CAROUSEL_HORIZONTAL_PADDING}>
      {/* Slide Carousel Container (fixed 2:3 height) */}
      <YStack width="100%" height={carouselHeight} position="relative">
        {/* Horizontal Paged List with Snap Interval */}
        <FlatList
          // Remount when the slide set changes (e.g. preview image → full images
          // + video) so `initialScrollIndex` re-applies on a fresh list. Without
          // this, an imperative re-scroll after the data change can be dropped and
          // the list stays at offset 0, i.e. the cloned last slide.
          key={slideResetKey}
          testID="product-carousel-list"
          ref={listRef}
          data={carouselSlides}
          horizontal
          initialScrollIndex={hasLoop ? initialVirtualIndex : undefined}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          // Bound the initial mount to the visible slide and its neighbors;
          // without these every image (and the video slide) mounts and starts
          // downloading the moment the screen opens, competing with the
          // detail API request for bandwidth.
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={5}
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
                <Pressable
                  accessibilityLabel={`${item.imageIndex + 1}. görseli tam ekranda aç`}
                  accessibilityRole="button"
                  disabled={!onImagePress}
                  onPress={() => onImagePress?.(item.imageIndex)}
                  style={{ width: itemWidth, height: carouselHeight }}
                >
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: itemWidth, height: carouselHeight }}
                    contentFit="contain"
                  />
                  <ProductFeatureAssetTicker featureIcons={featureIcons} />
                </Pressable>
              )}
            </YStack>
          )}
        />

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

      <ProductFeatureDescriptionTicker
        featureIcons={featureIcons}
        marginHorizontal={-32}
        width={screenWidth}
      />
    </YStack>
  );
}
