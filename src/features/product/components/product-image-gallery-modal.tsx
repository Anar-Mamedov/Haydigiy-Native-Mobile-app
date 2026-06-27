import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { X } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, useTheme, XStack, YStack } from 'tamagui';
import { clampGalleryZoomValue, getFocusedZoomTranslate } from '../utils/product-image-gallery-zoom';

const MAX_ZOOM_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.4;
const ZOOMED_THRESHOLD = 1.05;
const CLOSE_DRAG_THRESHOLD = 110;
const HEADER_BUTTON_SIZE = 44;
const HEADER_TOP_PADDING = 8;
const HEADER_BOTTOM_PADDING = 8;
const THUMBNAIL_SIZE = 60;
const THUMBNAIL_GAP = 8;
const THUMBNAIL_VERTICAL_PADDING = 12;
const THUMBNAIL_BORDER_WIDTH = 1;
const MIN_IMAGE_AREA_HEIGHT = 240;

type ProductImageGalleryModalProps = {
  images: string[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
};

type GalleryImage = {
  index: number;
  key: string;
  uri: string;
};

function getSafeIndex(index: number, length: number) {
  return Math.min(Math.max(index, 0), Math.max(length - 1, 0));
}

function getGalleryImages(images: string[]): GalleryImage[] {
  return images
    .filter((uri) => Boolean(uri))
    .map((uri, index) => ({
      index,
      key: `${index}-${uri}`,
      uri,
    }));
}

type ZoomableProductImageProps = {
  isActive: boolean;
  isZoomed: boolean;
  onClose: () => void;
  onZoomChange: (zoomed: boolean) => void;
  uri: string;
  width: number;
  height: number;
};

function ZoomableProductImage({
  isActive,
  isZoomed,
  onClose,
  onZoomChange,
  uri,
  width,
  height,
}: ZoomableProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const dismissTranslateY = useSharedValue(0);
  const dismissOpacity = useSharedValue(1);

  useEffect(() => {
    setHasError(false);
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    dismissTranslateY.value = withTiming(0);
    dismissOpacity.value = withTiming(1);
    if (isActive) {
      onZoomChange(false);
    }
  }, [
    dismissOpacity,
    dismissTranslateY,
    isActive,
    onZoomChange,
    savedScale,
    savedTranslateX,
    savedTranslateY,
    scale,
    translateX,
    translateY,
    uri,
  ]);

  const pinchGesture = Gesture.Pinch()
    .enabled(isActive)
    .onUpdate((event) => {
      scale.value = clampGalleryZoomValue(savedScale.value * event.scale, 1, MAX_ZOOM_SCALE);
    })
    .onEnd(() => {
      if (scale.value <= ZOOMED_THRESHOLD) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(onZoomChange)(false);
        return;
      }

      savedScale.value = scale.value;
      runOnJS(onZoomChange)(true);
    });

  const panGesture = Gesture.Pan()
    .enabled(isActive && isZoomed)
    .onUpdate((event) => {
      const maxX = (width * (scale.value - 1)) / 2;
      const maxY = (height * (scale.value - 1)) / 2;
      translateX.value = clampGalleryZoomValue(savedTranslateX.value + event.translationX, -maxX, maxX);
      translateY.value = clampGalleryZoomValue(savedTranslateY.value + event.translationY, -maxY, maxY);
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .enabled(isActive)
    .numberOfTaps(2)
    .onEnd((event) => {
      if (scale.value > ZOOMED_THRESHOLD) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(onZoomChange)(false);
        return;
      }

      const nextTranslateX = getFocusedZoomTranslate(width, event.x, DOUBLE_TAP_SCALE);
      const nextTranslateY = getFocusedZoomTranslate(height, event.y, DOUBLE_TAP_SCALE);

      scale.value = withTiming(DOUBLE_TAP_SCALE);
      savedScale.value = DOUBLE_TAP_SCALE;
      translateX.value = withTiming(nextTranslateX);
      translateY.value = withTiming(nextTranslateY);
      savedTranslateX.value = nextTranslateX;
      savedTranslateY.value = nextTranslateY;
      runOnJS(onZoomChange)(true);
    });

  const closeDragGesture = Gesture.Pan()
    .enabled(isActive && !isZoomed)
    .activeOffsetY(20)
    .failOffsetX([-24, 24])
    .onUpdate((event) => {
      if (event.translationY <= 0) return;
      dismissTranslateY.value = Math.min(event.translationY, 90);
      dismissOpacity.value = clampGalleryZoomValue(1 - event.translationY / 300, 0.35, 1);
    })
    .onEnd((event) => {
      if (event.translationY > CLOSE_DRAG_THRESHOLD) {
        runOnJS(onClose)();
        return;
      }

      dismissTranslateY.value = withTiming(0);
      dismissOpacity.value = withTiming(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: dismissOpacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value + dismissTranslateY.value },
      { scale: scale.value },
    ],
  }));

  const gestures = Gesture.Simultaneous(
    closeDragGesture,
    pinchGesture,
    panGesture,
    doubleTapGesture,
  );

  return (
    <GestureDetector gesture={gestures}>
      <Animated.View
        accessibilityLabel="Urun gorseli"
        style={[
          {
            alignItems: 'center',
            height,
            justifyContent: 'center',
            width,
          },
          animatedStyle,
        ]}
      >
        {hasError ? (
          <YStack alignItems="center" justifyContent="center" padding="$5">
            <Paragraph color="$color10" fontSize="$3">
              Resim yuklenemedi
            </Paragraph>
          </YStack>
        ) : (
          <Image
            contentFit="contain"
            onError={() => setHasError(true)}
            source={{ uri }}
            style={{ width, height }}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export function ProductImageGalleryModal({
  images,
  initialIndex,
  open,
  onClose,
}: ProductImageGalleryModalProps) {
  if (!open) return null;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible={open}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider style={{ flex: 1 }}>
          <ProductImageGalleryContent
            images={images}
            initialIndex={initialIndex}
            onClose={onClose}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Modal>
  );
}

function ProductImageGalleryContent({
  images,
  initialIndex,
  onClose,
}: Omit<ProductImageGalleryModalProps, 'open'>) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const listRef = useRef<FlatList<GalleryImage>>(null);
  const thumbnailsRef = useRef<ScrollView>(null);
  const galleryImages = useMemo(() => getGalleryImages(images), [images]);
  const safeInitialIndex = getSafeIndex(initialIndex, galleryImages.length);
  const [currentIndex, setCurrentIndex] = useState(safeInitialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const hasThumbnails = galleryImages.length > 1;
  const brandColor = theme.brand?.val;
  const borderColor = theme.borderColor.val;
  const iconColor = theme.color.val;
  const thumbnailBackgroundColor = theme.background.val;

  const topChromeHeight = insets.top + HEADER_TOP_PADDING + HEADER_BUTTON_SIZE + HEADER_BOTTOM_PADDING;
  const bottomChromeHeight = hasThumbnails
    ? insets.bottom + THUMBNAIL_SIZE + THUMBNAIL_VERTICAL_PADDING * 2 + THUMBNAIL_BORDER_WIDTH
    : insets.bottom;
  const imageAreaHeight = Math.max(height - topChromeHeight - bottomChromeHeight, MIN_IMAGE_AREA_HEIGHT);

  useEffect(() => {
    if (galleryImages.length === 0) return;
    const nextIndex = getSafeIndex(initialIndex, galleryImages.length);
    setCurrentIndex(nextIndex);
    setIsZoomed(false);
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ animated: false, index: nextIndex });
    });
    return () => cancelAnimationFrame(frame);
  }, [galleryImages.length, initialIndex]);

  useEffect(() => {
    if (!hasThumbnails) return;
    thumbnailsRef.current?.scrollTo({
      animated: true,
      x: Math.max(0, currentIndex * (THUMBNAIL_SIZE + THUMBNAIL_GAP) - width / 2 + THUMBNAIL_SIZE / 2),
      y: 0,
    });
  }, [currentIndex, hasThumbnails, width]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = getSafeIndex(Math.round(event.nativeEvent.contentOffset.x / width), galleryImages.length);
    setCurrentIndex(nextIndex);
    setIsZoomed(false);
  };

  const goToImage = useCallback(
    (index: number) => {
      const nextIndex = getSafeIndex(index, galleryImages.length);
      setCurrentIndex(nextIndex);
      setIsZoomed(false);
      listRef.current?.scrollToIndex({ animated: true, index: nextIndex });
    },
    [galleryImages.length],
  );

  if (galleryImages.length === 0) return null;

  return (
    <YStack backgroundColor="$background" flex={1} testID="product-image-gallery-modal">
      <YStack
        height={topChromeHeight}
        paddingBottom={HEADER_BOTTOM_PADDING}
        paddingHorizontal="$3"
        paddingTop={insets.top + HEADER_TOP_PADDING}
      >
        <XStack alignItems="center" height={HEADER_BUTTON_SIZE} justifyContent="space-between">
          <YStack width={HEADER_BUTTON_SIZE} />
          <Paragraph color="$color" fontSize="$3" fontWeight="700">
            {currentIndex + 1} / {galleryImages.length}
          </Paragraph>
          <Button
            accessibilityLabel="Kapat"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderWidth={1}
            chromeless
            circular
            hitSlop={10}
            icon={<X color={iconColor as any} size={22} />}
            onPress={onClose}
            pressStyle={{ backgroundColor: '$backgroundPress' }}
            size="$3"
            style={{ height: HEADER_BUTTON_SIZE, width: HEADER_BUTTON_SIZE }}
          />
        </XStack>
      </YStack>

      <FlatList
        ref={listRef}
        data={galleryImages}
        horizontal
        initialScrollIndex={safeInitialIndex}
        keyExtractor={(item) => item.key}
        getItemLayout={(_, index) => ({
          index,
          length: width,
          offset: width * index,
        })}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollToIndexFailed={({ index }) => {
          requestAnimationFrame(() => {
            listRef.current?.scrollToOffset({ animated: false, offset: width * index });
          });
        }}
        pagingEnabled
        renderItem={({ item }) => (
          <ZoomableProductImage
            height={imageAreaHeight}
            isActive={item.index === currentIndex}
            isZoomed={isZoomed}
            onClose={onClose}
            onZoomChange={setIsZoomed}
            uri={item.uri}
            width={width}
          />
        )}
        scrollEnabled={!isZoomed}
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, height: imageAreaHeight }}
        windowSize={3}
      />

      {hasThumbnails ? (
        <YStack
          backgroundColor="$backgroundHover"
          borderTopColor="$borderColor"
          borderTopWidth={THUMBNAIL_BORDER_WIDTH}
          height={bottomChromeHeight}
          paddingBottom={insets.bottom + THUMBNAIL_VERTICAL_PADDING}
          paddingTop={THUMBNAIL_VERTICAL_PADDING}
        >
          <ScrollView
            ref={thumbnailsRef}
            contentContainerStyle={{ gap: THUMBNAIL_GAP, paddingHorizontal: 12 }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {galleryImages.map((image) => {
              const active = image.index === currentIndex;
              return (
                <Pressable
                  accessibilityLabel={`Resim ${image.index + 1}`}
                  accessibilityRole="button"
                  key={image.key}
                  onPress={() => goToImage(image.index)}
                  style={({ pressed }) => ({
                    borderColor: active ? brandColor : borderColor,
                    borderRadius: 8,
                    borderWidth: 2,
                    height: THUMBNAIL_SIZE,
                    opacity: pressed ? 0.75 : active ? 1 : 0.82,
                    overflow: 'hidden',
                    width: THUMBNAIL_SIZE,
                  })}
                >
                  <Image
                    contentFit="contain"
                    source={{ uri: image.uri }}
                    style={{ width: '100%', height: '100%', backgroundColor: thumbnailBackgroundColor }}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </YStack>
      ) : (
        <YStack height={bottomChromeHeight} />
      )}
    </YStack>
  );
}
