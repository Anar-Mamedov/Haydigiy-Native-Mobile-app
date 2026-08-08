import { Separator, Spinner, YStack } from 'tamagui';
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
              accessibilityLabel={`${plan.installment} taksit`}
              disabled={disabled}
              onPress={() => onSelect(plan.installment)}
              right={
                <Paragraph color="$color" fontSize={14} fontWeight="700">
                  {plan.installment} x {formatCurrency(plan.perMonth)}
                </Paragraph>
              }
              selected={selectedInstallment === plan.installment}
            >
              <Paragraph color="$color" fontSize={14}>
                {plan.installment} Taksit
              </Paragraph>
            </CheckoutOptionRow>
          </YStack>
        ))
      )}
    </CheckoutSection>
  );
}
