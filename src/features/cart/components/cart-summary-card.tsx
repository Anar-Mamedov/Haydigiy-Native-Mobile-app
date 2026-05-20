import { Paragraph, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';
import {
  calculateCartItemCount,
  calculateCartSubtotal,
  useCartStore,
} from '@/features/cart/store/use-cart-store';
import { formatCurrency } from '@/utils/format-currency';

export function CartSummaryCard() {
  const items = useCartStore((state) => state.items);
  const itemCount = calculateCartItemCount(items);
  const subtotal = calculateCartSubtotal(items);

  return (
    <SectionCard>
      <YStack gap="$3">
        <Paragraph fontSize="$6" fontWeight="700">
          Cart Summary
        </Paragraph>
        <XStack justifyContent="space-between">
          <Paragraph color="$color10">Items</Paragraph>
          <Paragraph>{itemCount}</Paragraph>
        </XStack>
        <XStack justifyContent="space-between">
          <Paragraph color="$color10">Subtotal</Paragraph>
          <Paragraph fontWeight="700">{formatCurrency(subtotal)}</Paragraph>
        </XStack>
      </YStack>
    </SectionCard>
  );
}
