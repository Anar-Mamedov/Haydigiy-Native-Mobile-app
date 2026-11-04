import { Separator, Spinner, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CheckoutSection } from './checkout-section';
import { CheckoutOptionRow } from './checkout-option-row';
import { formatCurrency } from '@/utils/format-currency';
import { InstallmentPlan } from '@/types/checkout.types';

interface CheckoutInstallmentsProps {
  singlePaymentTotal: number;
  installmentPlans: InstallmentPlan[];
  selectedInstallment: number;
  onSelect: (count: number) => void;
  isLoading: boolean;
  /** Locks selection while `/order/token` is in flight (see `isCheckoutLocked`). */
  disabled?: boolean;
}

/** "Peşin Fiyatına" tag on interest-free plans (web `CardInformation` parity). */
function InterestFreeTag() {
  return (
    <YStack
      backgroundColor="$green3"
      borderRadius="$2"
      paddingHorizontal="$2"
      paddingVertical="$1"
      testID="installment-interest-free-tag"
    >
      <Paragraph color="$green11" fontSize={11} fontWeight="700" lineHeight={13}>
        Peşin Fiyatına
      </Paragraph>
    </YStack>
  );
}

/** Tek Çekim + installment plan picker (İyzico 3DS runs for any plan ≥ 2). */
export function CheckoutInstallments({
  singlePaymentTotal,
  installmentPlans,
  selectedInstallment,
  onSelect,
  isLoading,
  disabled = false,
}: CheckoutInstallmentsProps) {
  return (
    <CheckoutSection noBodyPadding title="Ödeme Seçenekleri">
      <CheckoutOptionRow
        accessibilityLabel="Tek çekim"
        disabled={disabled}
        onPress={() => onSelect(1)}
        right={
          <Paragraph color="$color" fontSize={14} fontWeight="700">
            {formatCurrency(singlePaymentTotal)}
          </Paragraph>
        }
        selected={selectedInstallment === 1}
      >
        <Paragraph color="$color" fontSize={14}>
          Tek Çekim
        </Paragraph>
      </CheckoutOptionRow>

      {isLoading ? (
        <YStack alignItems="center" paddingVertical="$3">
          <Spinner color="$brand" size="small" />
        </YStack>
      ) : (
        installmentPlans.map((plan) => (
          <YStack key={plan.installment}>
            <Separator borderColor="$borderColor" />
            <CheckoutOptionRow
              accessibilityLabel={
                plan.isInterestFree ? `${plan.installment} taksit, peşin fiyatına` : `${plan.installment} taksit`
              }
              disabled={disabled}
              onPress={() => onSelect(plan.installment)}
              right={
                <Paragraph color="$color" fontSize={14} fontWeight="700">
                  {plan.installment} x {formatCurrency(plan.perMonth)}
                </Paragraph>
              }
              selected={selectedInstallment === plan.installment}
            >
              <XStack alignItems="center" flexShrink={1} flexWrap="wrap" gap="$2">
                <Paragraph color="$color" fontSize={14}>
                  {plan.installment} Taksit
                </Paragraph>
                {plan.isInterestFree ? <InterestFreeTag /> : null}
              </XStack>
            </CheckoutOptionRow>
          </YStack>
        ))
      )}
    </CheckoutSection>
  );
}
