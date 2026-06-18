import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { CircleCheck, CircleX, Image as ImagePlaceholderIcon, Star } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, XStack, YStack } from 'tamagui';
import { OrderDetailItem as OrderDetailItemModel } from '@/types/order.types';
import { formatOrderPrice } from '../utils/order-status';

const THUMB_SIZE = 80;

type OrderDetailItemProps = {
  item: OrderDetailItemModel;
  onPressProduct: (slug: string) => void;
  /** Shows the review action: "available" → Değerlendir, "reviewed" → Değerlendirildi. */
  reviewState?: 'available' | 'reviewed';
  onReview?: () => void;
  /** Shows the "Ürünü İptal Et" action when the order is still cancellable. */
  cancelable?: boolean;
  onCancel?: () => void;
};

/** A single order line (image, name, size, quantity, price) used in detail sections. */
export function OrderDetailItem({
  item,
  onPressProduct,
  reviewState,
  onReview,
  cancelable,
  onCancel,
}: OrderDetailItemProps) {
  const inactive = item.kind !== 'normal';

  return (
    <YStack borderColor="$borderColor" borderRadius="$4" borderWidth={1} gap="$3" padding="$3">
      <XStack gap="$3">
        <Pressable
          accessibilityLabel={item.name || 'Ürün'}
          accessibilityRole="button"
          disabled={!item.slug}
          onPress={() => item.slug && onPressProduct(item.slug)}
        >
          <YStack
            alignItems="center"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderRadius="$3"
            borderWidth={1}
            height={THUMB_SIZE}
            justifyContent="center"
            opacity={inactive ? 0.6 : 1}
            overflow="hidden"
            width={THUMB_SIZE}
          >
            {item.image ? (
              <Image
                contentFit="contain"
                source={{ uri: item.image }}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <ImagePlaceholderIcon color="$color9" size={28} />
            )}
          </YStack>
        </Pressable>

        <YStack flex={1} gap="$1">
          <Paragraph
            color="$color"
            fontSize={14}
            fontWeight="600"
            numberOfLines={2}
            onPress={() => item.slug && onPressProduct(item.slug)}
          >
            {item.name}
          </Paragraph>
          {item.variantName ? (
            <Paragraph color="$color10" fontSize={12}>
              Beden: <Paragraph color="$color" fontSize={12} fontWeight="600">{item.variantName}</Paragraph>
            </Paragraph>
          ) : null}
          <Paragraph color="$color10" fontSize={12}>
            Adet: <Paragraph color="$color" fontSize={12} fontWeight="600">{item.quantity}</Paragraph>
          </Paragraph>
          <Paragraph color="$brand" fontSize={14} fontWeight="800">
            {formatOrderPrice(item.price)}
          </Paragraph>
          {item.note ? (
            <Paragraph color="$color10" fontSize={12}>
              {item.note}
            </Paragraph>
          ) : null}
        </YStack>
      </XStack>

      {cancelable ? (
        <Button
          accessibilityLabel="Ürünü iptal et"
          backgroundColor="$background"
          borderColor="$red8"
          borderRadius="$3"
          borderWidth={1}
          height={40}
          onPress={onCancel}
          pressStyle={{ backgroundColor: '$red2' }}
        >
          <XStack alignItems="center" gap="$1.5">
            <CircleX color="$red10" size={16} />
            <Paragraph color="$red10" fontSize={13} fontWeight="700">
              Ürünü İptal Et
            </Paragraph>
          </XStack>
        </Button>
      ) : null}

      {reviewState === 'available' ? (
        <Button
          accessibilityLabel="Ürünü değerlendir"
          backgroundColor="$brand"
          borderRadius="$3"
          height={40}
          onPress={onReview}
          pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
        >
          <XStack alignItems="center" gap="$1.5">
            <Star color="white" size={16} />
            <Paragraph color="white" fontSize={13} fontWeight="700">
              Değerlendir
            </Paragraph>
          </XStack>
        </Button>
      ) : reviewState === 'reviewed' ? (
        <XStack
          alignItems="center"
          backgroundColor="$green2"
          borderColor="$green6"
          borderRadius="$3"
          borderWidth={1}
          gap="$1.5"
          height={40}
          justifyContent="center"
        >
          <CircleCheck color="$green10" size={16} />
          <Paragraph color="$green10" fontSize={13} fontWeight="700">
            Değerlendirildi
          </Paragraph>
        </XStack>
      ) : null}
    </YStack>
  );
}
