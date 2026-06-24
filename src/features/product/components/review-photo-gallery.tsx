import { Modal, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { X } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { ProductReviewItem } from '../api/product-reviews.mapper';
import { formatDateTR } from '../utils/format-date-tr';
import { StarRating } from './star-rating';

type ReviewPhotoGalleryProps = {
  open: boolean;
  photos: ProductReviewItem[];
  initialIndex: number;
  onClose: () => void;
};

/** Full-screen, horizontally paged viewer for photo reviews. */
export function ReviewPhotoGallery({ open, photos, initialIndex, onClose }: ReviewPhotoGalleryProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={open}>
      <YStack backgroundColor="rgba(0,0,0,0.95)" flex={1}>
        <XStack justifyContent="flex-end" paddingHorizontal="$4" paddingTop={insets.top + 8}>
          <Pressable accessibilityLabel="Kapat" accessibilityRole="button" hitSlop={10} onPress={onClose}>
            <X color="white" size={28} />
          </Pressable>
        </XStack>

        <ScrollView
          contentOffset={{ x: initialIndex * width, y: 0 }}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {photos.map((review) => (
            <YStack alignItems="center" justifyContent="center" key={review.id} width={width}>
              <Image
                contentFit="contain"
                source={{ uri: review.photo ?? '' }}
                style={{ width: width - 24, height: width - 24 }}
              />
              <YStack gap="$1.5" paddingHorizontal="$5" paddingTop="$4">
                <XStack alignItems="center" gap="$2">
                  <StarRating rating={review.rating} size={14} />
                  <Paragraph color="white" fontSize={12}>
                    {review.userName}
                  </Paragraph>
                  <Paragraph color="rgba(255,255,255,0.6)" fontSize={12}>
                    {formatDateTR(review.createdAt)}
                  </Paragraph>
                </XStack>
                {review.comment ? (
                  <Paragraph color="rgba(255,255,255,0.85)" fontSize={13} lineHeight={19}>
                    {review.comment}
                  </Paragraph>
                ) : null}
              </YStack>
            </YStack>
          ))}
        </ScrollView>
      </YStack>
    </Modal>
  );
}
