import { useState } from 'react';
import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CalendarClock } from '@/components/ui/icons';
import { ProductImageGalleryModal } from '@/features/product/components/product-image-gallery-modal';
import { ReturnRejectionImage } from '@/types/order.types';

const COLUMNS = 2;

function toRows(images: ReturnRejectionImage[]): ReturnRejectionImage[][] {
  const rows: ReturnRejectionImage[][] = [];
  for (let index = 0; index < images.length; index += COLUMNS) {
    rows.push(images.slice(index, index + COLUMNS));
  }
  return rows;
}

function ImageTile({
  image,
  index,
  onPress,
}: {
  image: ReturnRejectionImage;
  index: number;
  onPress: () => void;
}) {
  const label = image.description || `Ret kanıtı ${index + 1}`;

  return (
    <YStack
      backgroundColor="$backgroundHover"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      flex={1}
      overflow="hidden"
    >
      <Pressable
        accessibilityHint="Görseli tam ekran açar"
        accessibilityLabel={label}
        accessibilityRole="imagebutton"
        onPress={onPress}
        testID={`return-rejection-image-${image.key}`}
      >
        <YStack aspectRatio={1} width="100%">
          <Image contentFit="cover" source={{ uri: image.url }} style={{ width: '100%', height: '100%' }} />
        </YStack>
      </Pressable>
      {image.description || image.capturedAt ? (
        <YStack gap="$1" padding="$2">
          {image.description ? (
            <Paragraph color="$color11" fontSize={12} lineHeight={16}>
              {image.description}
            </Paragraph>
          ) : null}
          {image.capturedAt ? (
            <XStack alignItems="center" gap="$1">
              <CalendarClock color="$color9" size={12} />
              <Paragraph color="$color9" fontSize={11}>
                {image.capturedAt}
              </Paragraph>
            </XStack>
          ) : null}
        </YStack>
      ) : null}
    </YStack>
  );
}

/**
 * Two-column grid of the warehouse's rejection photos; a tap opens the shared
 * full-screen gallery (pinch/double-tap zoom) like the web `Image.PreviewGroup`.
 */
export function ReturnRejectionImages({ images }: { images: ReturnRejectionImage[] }) {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <Paragraph color="$color10" fontSize={13}>
        Bu ret kaydı için görsel eklenmemiş.
      </Paragraph>
    );
  }

  return (
    <YStack gap="$3">
      {toRows(images).map((row, rowIndex) => (
        <XStack gap="$3" key={row[0].key}>
          {row.map((image, columnIndex) => {
            const index = rowIndex * COLUMNS + columnIndex;
            return (
              <ImageTile
                image={image}
                index={index}
                key={image.key}
                onPress={() => setGalleryIndex(index)}
              />
            );
          })}
          {/* Tek kalan görsel yarım genişlikte kalsın. */}
          {row.length < COLUMNS ? <YStack flex={1} /> : null}
        </XStack>
      ))}

      {/* Sheet'in içinde render edilir ki tam ekran modal sheet'in üstünde açılsın. */}
      <ProductImageGalleryModal
        images={images.map((image) => image.url)}
        initialIndex={galleryIndex ?? 0}
        onClose={() => setGalleryIndex(null)}
        open={galleryIndex !== null}
      />
    </YStack>
  );
}
