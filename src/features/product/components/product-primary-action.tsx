import { Bell, ShoppingCart } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, XStack, YStack } from 'tamagui';
import { resolveProductActionState } from '../utils/product-action-state';

type ProductPrimaryActionProps = {
  height: number;
  isApprovedForSale: boolean;
  isAuthenticated: boolean;
  isLastOne: boolean;
  isNotified: boolean;
  isNotifying: boolean;
  isOutOfStock: boolean;
  onAddToCart: () => void;
  onNotifyMe: () => void;
};

/** Alt bardaki birincil aksiyonun görsel karşılığı; kararı ortak resolver veriyor. */
export function ProductPrimaryAction({
  height,
  isApprovedForSale,
  isAuthenticated,
  isLastOne,
  isNotified,
  isNotifying,
  isOutOfStock,
  onAddToCart,
  onNotifyMe,
}: ProductPrimaryActionProps) {
  const state = resolveProductActionState({
    isApprovedForSale,
    isAuthenticated,
    isNotified,
    isOutOfStock,
  });

  if (state !== 'add-to-cart') {
    if (state === 'sold-out-guest') {
      return (
        <Button
          accessibilityLabel="Tükendi"
          accessibilityState={{ disabled: true }}
          backgroundColor="$color4"
          borderRadius={8}
          borderWidth={0}
          disabled
          flex={1}
          height={height}
          testID="product-out-of-stock"
        >
          <Paragraph color="$color10" fontSize={14} fontWeight="800">
            Tükendi
          </Paragraph>
        </Button>
      );
    }

    if (state === 'notify-requested') {
      return (
        <Button
          accessibilityLabel="Stok bildirimi talebin alındı"
          accessibilityState={{ disabled: true }}
          backgroundColor="$green10"
          borderRadius={8}
          borderWidth={0}
          disabled
          flex={1}
          height={height}
          testID="product-notify-requested"
        >
          <XStack alignItems="center" gap="$2">
            <Bell color="white" size={18} />
            <Paragraph color="white" fontSize={14} fontWeight="800">
              Talebini Aldık
            </Paragraph>
          </XStack>
        </Button>
      );
    }

    return (
      <Button
        accessibilityLabel="Ürün gelince haber ver"
        accessibilityState={{ disabled: isNotifying }}
        backgroundColor="$background"
        borderColor="$brand"
        borderRadius={8}
        borderWidth={1}
        disabled={isNotifying}
        flex={1}
        height={height}
        onPress={onNotifyMe}
        opacity={isNotifying ? 0.6 : 1}
        pressStyle={{ opacity: 0.75 }}
        testID="product-notify-me"
      >
        <XStack alignItems="center" gap="$2">
          <Bell color="$brand" size={18} />
          <Paragraph color="$brand" fontSize={14} fontWeight="800">
            {isNotifying ? 'Gönderiliyor...' : 'Gelince Haber Ver'}
          </Paragraph>
        </XStack>
      </Button>
    );
  }

  return (
    <Button
      accessibilityLabel="Sepete ekle"
      accessibilityRole="button"
      accessibilityState={{ disabled: !isApprovedForSale }}
      backgroundColor={isApprovedForSale ? '$brand' : '$color5'}
      borderRadius={8}
      disabled={!isApprovedForSale}
      flex={1}
      height={height}
      onPress={onAddToCart}
      padding={0}
      pressStyle={{ backgroundColor: '#df6810' }}
      testID="product-add-to-cart"
    >
      <YStack alignItems="center" justifyContent="center">
        <XStack alignItems="center" gap="$2">
          <ShoppingCart color="white" size={18} />
          <Paragraph color="white" fontSize={14} fontWeight="800">
            Sepete Ekle
          </Paragraph>
        </XStack>
        {isLastOne && (
          <Paragraph color="#FEE2E2" fontSize={10} fontWeight="700" marginTop={1}>
            Son 1 Ürün!
          </Paragraph>
        )}
      </YStack>
    </Button>
  );
}
