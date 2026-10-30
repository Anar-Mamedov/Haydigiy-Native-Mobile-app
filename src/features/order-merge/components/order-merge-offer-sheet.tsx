import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ConfirmSheet } from '@/components/ui/confirm-sheet';
import { OrderMergeOffer } from '@/types/order-merge.types';

type Props = {
  open: boolean;
  offer: OrderMergeOffer | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onContinueAsNewOrder: () => void;
  onDismiss: () => void;
};

/**
 * Offers to add the cart to the approved order with free shipping. Renders the
 * backend's texts as they are; the installment badge only appears for installment
 * card orders. Tapping outside only closes; the secondary button continues checkout.
 */
export function OrderMergeOfferSheet({
  open,
  offer,
  isSubmitting,
  onConfirm,
  onContinueAsNewOrder,
  onDismiss,
}: Props) {
  if (!offer) return null;

  return (
    <ConfirmSheet
      cancelLabel={offer.continueLabel}
      confirmLabel={offer.confirmLabel}
      description={offer.description || undefined}
      isConfirming={isSubmitting}
      onCancel={onContinueAsNewOrder}
      onConfirm={onConfirm}
      onOpenChange={(next) => {
        if (!next) onDismiss();
      }}
      open={open}
      testID="order-merge-offer"
      title={offer.title}
    >
      {offer.amountText ? (
        <XStack
          alignItems="center"
          backgroundColor="$backgroundHover"
          borderColor="$borderColor"
          borderRadius="$4"
          borderWidth={1}
          flexWrap="wrap"
          gap="$2"
          justifyContent="space-between"
          padding="$3"
          testID="order-merge-offer-amount"
        >
          <YStack flexShrink={1} gap="$1">
            <Paragraph color="$color10" fontSize={12}>
              Siparişinize eklenecek tutar
            </Paragraph>
            <Paragraph color="$color" fontSize={18} fontWeight="800">
              {offer.amountText}
            </Paragraph>
          </YStack>
          {offer.installmentText ? (
            <XStack
              backgroundColor="$green2"
              borderColor="$green6"
              borderRadius={999}
              borderWidth={1}
              paddingHorizontal="$2.5"
              paddingVertical="$1"
              testID="order-merge-offer-installment"
            >
              <Paragraph color="$green11" fontSize={12} fontWeight="700">
                {offer.installmentText}
              </Paragraph>
            </XStack>
          ) : null}
        </XStack>
      ) : null}
    </ConfirmSheet>
  );
}
