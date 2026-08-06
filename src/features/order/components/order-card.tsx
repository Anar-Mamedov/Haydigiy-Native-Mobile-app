import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Image as ImagePlaceholderIcon } from '@/components/ui/icons';
import { Button, ScrollView, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui';
import { Order, OrderProduct } from '@/types/order.types';
import { formatOrderDate, getOrderStatusIcon, getOrderStatusText } from '../utils/order-status';

const MAX_THUMBS = 8;
const THUMB_SIZE = 80;

type OrderCardProps = {
  order: Order;
  onPressDetails: () => void;
  onPressProduct: (slug: string) => void;
};

function ProductThumb({
  product,
  onPress,
}: {
  product: OrderProduct;
  onPress: () => void;
}) {
  const inactive = product.kind !== 'normal';
  const badge = product.kind === 'cancelled' ? 'İptal' : product.kind === 'returned' ? 'İade' : null;

  return (
    <Pressable
      accessibilityLabel={product.name || 'Ürün'}
      accessibilityRole="button"
      disabled={!product.slug}
      onPress={onPress}
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
        position="relative"
        width={THUMB_SIZE}
      >
        {badge ? (
          <XStack
            backgroundColor="rgba(0,0,0,0.6)"
            borderRadius="$1"
            left={4}
            paddingHorizontal={4}
            position="absolute"
            top={4}
            zIndex={10}
          >
            <Paragraph color="white" fontSize={10} fontWeight="800">
              {badge}
            </Paragraph>
          </XStack>
        ) : null}
        {product.image ? (
          <Image
            contentFit="contain"
            source={{ uri: product.image }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <ImagePlaceholderIcon color="$color9" size={28} />
        )}
      </YStack>
    </Pressable>
  );
}

export function OrderCard({ order, onPressDetails, onPressProduct }: OrderCardProps) {
  const Icon = getOrderStatusIcon(order.status);
  const statusColor = (order.statusColor ?? '$color') as never;
  const dateLabel = formatOrderDate(order.createdAt);
  const thumbs = order.products.slice(0, MAX_THUMBS);
  const overflow = order.products.length - MAX_THUMBS;

  return (
    <SectionCard padding="$3">
      <YStack gap="$3">
        {/* Header */}
        <XStack
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          gap="$3"
          justifyContent="space-between"
          paddingBottom="$2.5"
        >
          <YStack flex={1} gap="$1">
            <Paragraph color="$color10" fontSize={12}>
              Sipariş No: {order.orderNo}
            </Paragraph>
            <Paragraph color="$color10" fontSize={12}>
              {dateLabel}
            </Paragraph>
            {order.isFullyCancelled ? (
              <Paragraph color="$red10" fontSize={13} fontWeight="700">
                Sipariş iptal edildi
              </Paragraph>
            ) : (
              <Paragraph color="$color" fontSize={13} fontWeight="700">
                {order.shipmentCount} Teslimat, {order.productCount} Ürün
              </Paragraph>
            )}
            {order.receiver ? (
              <Paragraph color="$color10" fontSize={12}>
                Alıcı: {order.receiver}
              </Paragraph>
            ) : null}
          </YStack>

          <YStack alignItems="flex-end" gap="$1">
            <Paragraph color="$color10" fontSize={11} fontWeight="700">
              Toplam
            </Paragraph>
            <Paragraph color="$brand" fontSize={14} fontWeight="800">
              {order.totalPrice}
            </Paragraph>
            <Button
              accessibilityLabel="Sipariş detayları"
              backgroundColor="$brand"
              borderRadius="$3"
              height={30}
              marginTop="$1"
              onPress={onPressDetails}
              paddingHorizontal="$3"
              pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
            >
              <Paragraph color="white" fontSize={12} fontWeight="700">
                Detaylar
              </Paragraph>
            </Button>
          </YStack>
        </XStack>

        {/* Status */}
        <XStack alignItems="center" gap="$2">
          <Icon color={statusColor} size={20} />
          <Paragraph color={statusColor} flex={1} fontSize={14} fontWeight="500">
            {getOrderStatusText(order.status)}
          </Paragraph>
        </XStack>

        {/* Return reasons (İadeler) */}
        {order.returnReasons && order.returnReasons.length > 0 ? (
          <Paragraph color="$color10" fontSize={13}>
            İade nedeni:{' '}
            <Paragraph color="$color" fontSize={13} fontWeight="600">
              {order.returnReasons.join(', ')}
            </Paragraph>
          </Paragraph>
        ) : null}

        {/* Product thumbnails */}
        {order.products.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {thumbs.map((product, index) => (
              <ProductThumb
                key={`${product.slug || product.name}-${index}`}
                onPress={() => product.slug && onPressProduct(product.slug)}
                product={product}
              />
            ))}
            {overflow > 0 ? (
              <Pressable
                accessibilityLabel="Tüm ürünleri gör"
                accessibilityRole="button"
                onPress={onPressDetails}
              >
                <YStack
                  alignItems="center"
                  backgroundColor="$backgroundHover"
                  borderColor="$borderColor"
                  borderRadius="$3"
                  borderWidth={1}
                  height={THUMB_SIZE}
                  justifyContent="center"
                  width={THUMB_SIZE}
                >
                  <Paragraph color="$color" fontSize={16} fontWeight="800">
                    +{overflow}
                  </Paragraph>
                  <Paragraph color="$color10" fontSize={11}>
                    Detaylar
                  </Paragraph>
                </YStack>
              </Pressable>
            ) : null}
          </ScrollView>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
