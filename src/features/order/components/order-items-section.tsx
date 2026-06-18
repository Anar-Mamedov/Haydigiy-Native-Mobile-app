import { Paragraph, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';
import { OrderDetailItem as OrderDetailItemModel } from '@/types/order.types';
import { OrderDetailItem } from './order-detail-item';

type OrderItemsSectionProps = {
  title: string;
  items: OrderDetailItemModel[];
  onPressProduct: (slug: string) => void;
  titleColor?: string;
};

/** Titled card listing order lines; reused for delivered / cancelled / returned. */
export function OrderItemsSection({
  title,
  items,
  onPressProduct,
  titleColor = '$color',
}: OrderItemsSectionProps) {
  if (items.length === 0) return null;

  return (
    <SectionCard padding="$3">
      <YStack gap="$3">
        <Paragraph color={titleColor as never} fontSize={15} fontWeight="700">
          {title}
        </Paragraph>
        <YStack gap="$3">
          {items.map((item, index) => (
            <OrderDetailItem
              item={item}
              key={`${item.id}-${index}`}
              onPressProduct={onPressProduct}
            />
          ))}
        </YStack>
      </YStack>
    </SectionCard>
  );
}
