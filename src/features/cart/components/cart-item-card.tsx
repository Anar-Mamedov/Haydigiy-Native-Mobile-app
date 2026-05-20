import { Image } from 'expo-image';
import { Minus, Plus, Trash2 } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { AppButton, SectionCard } from '@/components/ui';
import { tokenValues } from '@/lib/theme/token-values';
import { CartLineItem } from '@/types/cart.types';
import { formatCurrency } from '@/utils/format-currency';

type CartItemCardProps = {
  item: CartLineItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

export function CartItemCard({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}: CartItemCardProps) {
  return (
    <SectionCard>
      <XStack gap="$3">
        <Image
          contentFit="cover"
          source={{ uri: item.imageUrl }}
          style={{
            borderRadius: tokenValues.cartItemImageRadius,
            height: tokenValues.cartItemImageSize,
            width: tokenValues.cartItemImageSize,
          }}
        />
        <YStack flex={1} gap="$2">
          <Paragraph fontWeight="700">{item.title}</Paragraph>
          <Paragraph color="$color10" size="$3">
            Seller: {item.sellerName}
          </Paragraph>
          <Paragraph>{formatCurrency(item.unitPrice)}</Paragraph>
          <XStack alignItems="center" gap="$2">
            <AppButton circular icon={Minus} onPress={onDecrease} size="$3" />
            <Paragraph minWidth="$3" textAlign="center">
              {item.quantity}
            </Paragraph>
            <AppButton circular icon={Plus} onPress={onIncrease} size="$3" />
            <AppButton icon={Trash2} marginLeft="auto" onPress={onRemove} size="$3">
              Remove
            </AppButton>
          </XStack>
        </YStack>
      </XStack>
    </SectionCard>
  );
}
