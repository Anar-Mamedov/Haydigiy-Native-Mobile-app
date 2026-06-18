import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Image as ImagePlaceholderIcon } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { OrderDetailItem as OrderDetailItemModel } from '@/types/order.types';
import { formatOrderPrice } from '../utils/order-status';

const THUMB_SIZE = 80;

type OrderDetailItemProps = {
  item: OrderDetailItemModel;
  onPressProduct: (slug: string) => void;
};

/** A single order line (image, name, size, quantity, price) used in detail sections. */
export function OrderDetailItem({ item, onPressProduct }: OrderDetailItemProps) {
  const inactive = item.kind !== 'normal';

  return (
    <XStack
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      gap="$3"
      padding="$3"
    >
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
  );
}
