import { ReactNode } from 'react';
import { Paragraph, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';
import { OrderDetailItem as OrderDetailItemModel } from '@/types/order.types';
import { OrderDetailItem } from './order-detail-item';

type OrderItemsSectionProps = {
  title: string;
  items: OrderDetailItemModel[];
  onPressProduct: (slug: string) => void;
  titleColor?: string;
  /** Optional element rendered on the right of the title row (e.g. "İade oluştur"). */
  headerAction?: ReactNode;
  /** When true, delivered items show a "Değerlendir / Değerlendirildi" action. */
  reviewable?: boolean;
  onReview?: (item: OrderDetailItemModel) => void;
  /** When true, items show an "Ürünü İptal Et" action. */
  cancelable?: boolean;
  onCancelItem?: (item: OrderDetailItemModel) => void;
  /** When true, items show a return action (or an "İade/Değişim Yok" chip). */
  returnable?: boolean;
  onReturnItem?: (item: OrderDetailItemModel) => void;
  /** Web paritesi: iptal/iade mümkün değilse "Tekrar Satın Al" gösterilir. */
  repurchasable?: boolean;
  onRepurchaseItem?: (item: OrderDetailItemModel) => void;
};

/** Titled card listing order lines; reused for delivered / cancelled / returned. */
export function OrderItemsSection({
  title,
  items,
  onPressProduct,
  titleColor = '$color',
  headerAction,
  reviewable,
  onReview,
  cancelable,
  onCancelItem,
  returnable,
  onReturnItem,
  repurchasable,
  onRepurchaseItem,
}: OrderItemsSectionProps) {
  if (items.length === 0) return null;

  return (
    <SectionCard padding="$3">
      <YStack gap="$3">
        <XStack alignItems="center" gap="$2" justifyContent="space-between">
          <Paragraph color={titleColor as never} fontSize={15} fontWeight="700">
            {title}
          </Paragraph>
          {headerAction}
        </XStack>
        <YStack gap="$3">
          {items.map((item, index) => (
            <OrderDetailItem
              cancelable={cancelable}
              item={item}
              key={`${item.id}-${index}`}
              onCancel={onCancelItem ? () => onCancelItem(item) : undefined}
              onPressProduct={onPressProduct}
              onRepurchase={onRepurchaseItem ? () => onRepurchaseItem(item) : undefined}
              onReturn={onReturnItem ? () => onReturnItem(item) : undefined}
              onReview={onReview ? () => onReview(item) : undefined}
              repurchasable={repurchasable}
              returnState={
                returnable ? (item.isNonReturnable ? 'blocked' : 'available') : undefined
              }
              reviewState={reviewable ? (item.isReviewed ? 'reviewed' : 'available') : undefined}
            />
          ))}
        </YStack>
      </YStack>
    </SectionCard>
  );
}
