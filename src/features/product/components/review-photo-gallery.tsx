import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Calendar, ChevronLeft, ChevronRight, Package, ShoppingBag, Tag, X } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, XStack, YStack } from 'tamagui';
import { ProductReviewItem, ReviewProduct } from '../api/product-reviews.mapper';
import { formatDateTR } from '../utils/format-date-tr';
import { ProductImageGalleryModal } from './product-image-gallery-modal';
import { StarRating } from './star-rating';

type ReviewPhotoGalleryProps = {
  open: boolean;
  photos: ProductReviewItem[];
  initialIndex: number;
  product?: ReviewProduct | null;
  onClose: () => void;
  onAddToCartPress?: () => void;
};

function getSafeIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return Math.min(Math.max(index, 0), length - 1);
}

/** Frontend-style photo review modal with image navigation and review details. */
export function ReviewPhotoGallery({
  open,
  photos,
  initialIndex,
  product,
  onClose,
  onAddToCartPress,
}: ReviewPhotoGalleryProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(() => getSafeIndex(initialIndex, photos.length));
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (open) setActiveIndex(getSafeIndex(initialIndex, photos.length));
  }, [initialIndex, open, photos.length]);

  const activeReview = photos[getSafeIndex(activeIndex, photos.length)];
  const canNavigate = photos.length > 1;
  const modalWidth = Math.min(width - 24, 720);
  const imageHeight = Math.min(height * 0.52, modalWidth * 1.12);
  const zoomImages = useMemo(
    () => photos.map((review) => review.photo).filter((photo): photo is string => Boolean(photo)),
    [photos],
  );
  const productPrice = useMemo(() => {
    const price = product?.price?.trim();
    if (!price) return '';
    return price.toLocaleLowerCase('tr-TR').includes('tl') ? price : `${price} TL`;
  }, [product?.price]);

  const showPrevious = () => {
    setActiveIndex((current) => (current <= 0 ? photos.length - 1 : current - 1));
  };

  const showNext = () => {
    setActiveIndex((current) => (current >= photos.length - 1 ? 0 : current + 1));
  };

  const handleAddToCartPress = () => {
    onClose();
    onAddToCartPress?.();
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={open}>
      <YStack
        alignItems="center"
        backgroundColor="rgba(0,0,0,0.72)"
        flex={1}
        justifyContent="center"
        paddingBottom={Math.max(insets.bottom, 12)}
        paddingHorizontal="$3"
        paddingTop={Math.max(insets.top, 12)}
      >
        <YStack
          backgroundColor="$background"
          borderRadius={12}
          maxHeight={height - insets.top - insets.bottom - 24}
          overflow="hidden"
          width={modalWidth}
        >
          <YStack alignItems="center" backgroundColor="black" height={imageHeight} justifyContent="center">
            {activeReview ? (
              <Pressable
                accessibilityLabel="Degerlendirme fotografini tam ekran ac"
                accessibilityRole="imagebutton"
                onPress={() => setZoomOpen(true)}
              >
                <Image
                  contentFit="contain"
                  source={{ uri: activeReview.photo ?? '' }}
                  style={{ width: modalWidth, height: imageHeight }}
                  testID="review-photo-gallery-image"
                />
              </Pressable>
            ) : null}

            {canNavigate ? (
              <>
                <Pressable
                  accessibilityLabel="Onceki fotograf"
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={showPrevious}
                  style={{ left: 12, position: 'absolute', top: imageHeight / 2 - 20 }}
                >
                  <XStack
                    alignItems="center"
                    backgroundColor="rgba(255,255,255,0.86)"
                    borderRadius={20}
                    height={40}
                    justifyContent="center"
                    width={40}
                  >
                    <ChevronLeft color="#111827" size={24} />
                  </XStack>
                </Pressable>
                <Pressable
                  accessibilityLabel="Sonraki fotograf"
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={showNext}
                  style={{ position: 'absolute', right: 12, top: imageHeight / 2 - 20 }}
                >
                  <XStack
                    alignItems="center"
                    backgroundColor="rgba(255,255,255,0.86)"
                    borderRadius={20}
                    height={40}
                    justifyContent="center"
                    width={40}
                  >
                    <ChevronRight color="#111827" size={24} />
                  </XStack>
                </Pressable>
              </>
            ) : null}
          </YStack>

          {activeReview ? (
            <YStack gap="$3" padding="$4">
              <XStack alignItems="flex-start" gap="$2" justifyContent="space-between">
                <YStack flex={1} gap="$2">
                  <XStack alignItems="center" flexWrap="wrap" gap="$2">
                    <StarRating rating={activeReview.rating} size={14} />
                    <Paragraph color="$color" fontSize={13} fontWeight="600">
                      {activeReview.userName}
                    </Paragraph>
                    <Paragraph color="$color9" fontSize={12}>
                      #{activeReview.id}
                    </Paragraph>
                  </XStack>

                  <XStack alignItems="center" gap="$1.5">
                    <Calendar color="$color9" size={12} />
                    <Paragraph color="$color10" fontSize={12}>
                      {formatDateTR(activeReview.createdAt)}
                    </Paragraph>
                  </XStack>

                  <XStack flexWrap="wrap" gap="$3">
                    {activeReview.size ? (
                      <XStack alignItems="center" gap="$1">
                        <Tag color="$color9" size={11} />
                        <Paragraph color="$color10" fontSize={11}>
                          Beden: {activeReview.size}
                        </Paragraph>
                      </XStack>
                    ) : null}
                    {activeReview.height ? (
                      <XStack alignItems="center" gap="$1">
                        <Package color="$color9" size={11} />
                        <Paragraph color="$color10" fontSize={11}>
                          Boy: {activeReview.height}cm
                        </Paragraph>
                      </XStack>
                    ) : null}
                    {activeReview.weight ? (
                      <XStack alignItems="center" gap="$1">
                        <Package color="$color9" size={11} />
                        <Paragraph color="$color10" fontSize={11}>
                          Kilo: {activeReview.weight}kg
                        </Paragraph>
                      </XStack>
                    ) : null}
                  </XStack>

                  {activeReview.comment ? (
                    <Paragraph color="$color11" fontSize={13} lineHeight={19}>
                      {activeReview.comment}
                    </Paragraph>
                  ) : null}
                </YStack>

                <Pressable accessibilityLabel="Kapat" accessibilityRole="button" hitSlop={10} onPress={onClose}>
                  <X color="$color9" size={24} />
                </Pressable>
              </XStack>

              {product ? (
                <XStack
                  borderColor="$borderColor"
                  borderRadius={8}
                  borderWidth={1}
                  gap="$3"
                  padding="$3"
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.08}
                  shadowRadius={3}
                >
                  {product.imageUrl ? (
                    <Image
                      contentFit="cover"
                      source={{ uri: product.imageUrl }}
                      style={{ width: 72, height: 90, borderRadius: 8 }}
                    />
                  ) : null}
                  <YStack flex={1} gap="$2">
                    <Paragraph color="$color" fontSize={13} fontWeight="700" lineHeight={18} numberOfLines={2}>
                      {product.name}
                    </Paragraph>
                    {productPrice ? (
                      <Paragraph color="$brand" fontSize={16} fontWeight="800">
                        {productPrice}
                      </Paragraph>
                    ) : null}
                    {onAddToCartPress ? (
                      <Button
                        accessibilityLabel="Sepete ekle"
                        backgroundColor="$brand"
                        borderRadius={8}
                        height={36}
                        icon={<ShoppingBag color="white" size={16} />}
                        onPress={handleAddToCartPress}
                        pressStyle={{ opacity: 0.85 }}
                      >
                        <Paragraph color="white" fontSize={13} fontWeight="700">
                          Sepete Ekle
                        </Paragraph>
                      </Button>
                    ) : null}
                  </YStack>
                </XStack>
              ) : null}
            </YStack>
          ) : (
            <YStack alignItems="center" padding="$5">
              <Paragraph color="$color10" fontSize={13}>
                Fotograf bulunamadi.
              </Paragraph>
            </YStack>
          )}
        </YStack>
      </YStack>
      {zoomOpen ? (
        <ProductImageGalleryModal
          images={zoomImages}
          initialIndex={getSafeIndex(activeIndex, zoomImages.length)}
          onClose={() => setZoomOpen(false)}
          open
        />
      ) : null}
    </Modal>
  );
}
