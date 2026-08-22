import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Clock, Trash2 } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { QuantityStepper } from '@/components/ui';
import { CartLineItem } from '@/types/cart.types';
import { BundleComponent } from '@/types/bundle.types';
import { BundleContents } from '@/components/bundle/bundle-contents';
import { getCartLineMaxQuantity, isBundleCartLine } from '@/features/cart/utils/cart-line';
import { formatCurrency } from '@/utils/format-currency';

const LOW_STOCK_THRESHOLD = 3;
const IMAGE_WIDTH = 96;
const IMAGE_HEIGHT = 120;

type CartItemCardProps = {
  item: CartLineItem;
  updating?: boolean;
  /** Shipping estimate message from `/shipping-estimate`, shown per item like the web cart. */
  deliveryMessage?: string;
  onQuantityChange: (quantity: number) => void;
  onRemovePress: () => void;
  onPressProduct: () => void;
  /** Paket içeriğindeki bir ürüne dokunulduğunda o ürünün detayına gider. */
  onPressBundleComponent?: (component: BundleComponent) => void;
};

export function CartItemCard({
  item,
  updating,
  deliveryMessage,
  onQuantityChange,
  onRemovePress,
  onPressProduct,
  onPressBundleComponent,
}: CartItemCardProps) {
  const stock = item.stock;
  // Bundle satırı stok bildirmez; "Son 1 ürün"/"Stokta tükeniyor" rozetleri paket için gösterilmez.
  const isBundle = isBundleCartLine(item);
  const isLastOne = !isBundle && stock === 1;
  const isLowStock = !isBundle && typeof stock === 'number' && stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  const hasDiscount = item.originalPrice !== undefined && item.originalPrice > item.unitPrice;

  const lineTotal = item.unitPrice * item.quantity;
  const originalLineTotal = (item.originalPrice ?? item.unitPrice) * item.quantity;

  return (
    <XStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$5"
      borderWidth={1}
      gap="$3"
      padding="$3"
    >
      {/* Product image with low-stock badge */}
      <Pressable
        accessibilityLabel={`${item.title} ürün detayı`}
        accessibilityRole="button"
        onPress={onPressProduct}
      >
        <YStack
          backgroundColor="$backgroundHover"
          borderColor="$borderColor"
          borderRadius="$3"
          borderWidth={1}
          height={IMAGE_HEIGHT}
          overflow="hidden"
          position="relative"
          width={IMAGE_WIDTH}
        >
          <Image
            contentFit="contain"
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', height: '100%' }}
          />
          {isLastOne ? (
            <XStack
              alignItems="center"
              backgroundColor="$red10"
              bottom={0}
              justifyContent="center"
              left={0}
              paddingVertical={2}
              position="absolute"
              right={0}
            >
              <Paragraph color="white" fontSize={10} fontWeight="800">
                Son 1 Ürün!
              </Paragraph>
            </XStack>
          ) : null}
          {isBundle ? (
            <XStack
              alignItems="center"
              backgroundColor="$brand"
              bottom={0}
              justifyContent="center"
              left={0}
              paddingVertical={2}
              position="absolute"
              right={0}
            >
              <Paragraph color="white" fontSize={10} fontWeight="800">
                PAKET
              </Paragraph>
            </XStack>
          ) : null}
        </YStack>
      </Pressable>

      {/* Product info */}
      <YStack flex={1} gap="$1.5">
        <XStack alignItems="flex-start" gap="$2" justifyContent="space-between">
          <Paragraph
            color="$color"
            flex={1}
            fontSize={15}
            fontWeight="600"
            numberOfLines={2}
            onPress={onPressProduct}
          >
            {item.title}
          </Paragraph>
          <Pressable
            accessibilityLabel={`${item.title} ürününü sepetten kaldır`}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onRemovePress}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 2 })}
          >
            <Trash2 color="$color9" size={20} />
          </Pressable>
        </XStack>

        {!isBundle && item.size ? (
          <Paragraph color="$color10" fontSize={13}>
            Beden: <Paragraph color="$color" fontWeight="600">{item.size}</Paragraph>
          </Paragraph>
        ) : null}

        {/* Paket içeriği — bundle tek satır, ürünleri yalnızca burada listelenir */}
        {isBundle && item.bundleComponents?.length ? (
          <BundleContents components={item.bundleComponents} onPressComponent={onPressBundleComponent} />
        ) : null}

        {isLowStock ? (
          <XStack alignItems="center" gap="$1">
            <Clock color="$red10" size={12} />
            <Paragraph color="$red10" fontSize={12} fontWeight="700">
              Stokta tükeniyor
            </Paragraph>
          </XStack>
        ) : null}

        {/* Per-item shipping estimate message (from /shipping-estimate) */}
        <XStack alignItems="flex-start" gap="$1.5" marginTop="$1">
          <Image
            contentFit="contain"
            source={require('../../../../assets/images/green-fast-delivery.svg')}
            style={{ width: 20, height: 16, marginTop: 1 }}
          />
          <Paragraph color="$green10" flex={1} fontSize={13} fontWeight="700" lineHeight={17}>
            {deliveryMessage || 'Yükleniyor...'}
          </Paragraph>
        </XStack>

        <XStack alignItems="flex-end" justifyContent="space-between" marginTop="$2">
          <QuantityStepper
            accessibilityLabel={item.title}
            loading={updating}
            max={getCartLineMaxQuantity(item) || undefined}
            onChange={onQuantityChange}
            value={item.quantity}
          />

          <YStack alignItems="flex-end">
            {hasDiscount ? (
              <Paragraph
                color="$color10"
                fontSize={13}
                textDecorationLine="line-through"
              >
                {formatCurrency(originalLineTotal)}
              </Paragraph>
            ) : null}
            <Paragraph color="$brand" fontSize={18} fontWeight="800">
              {formatCurrency(lineTotal)}
            </Paragraph>
          </YStack>
        </XStack>
      </YStack>
    </XStack>
  );
}
