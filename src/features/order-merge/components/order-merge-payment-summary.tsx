import { Separator, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CheckoutSection } from '@/features/checkout/components/checkout-section';
import { OrderMergeCardSession } from '@/types/order-merge.types';
import { formatCurrency } from '@/utils/format-currency';

type Props = {
  session: OrderMergeCardSession;
};

function SummaryRow({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <XStack alignItems="center" gap="$3" justifyContent="space-between">
      <Paragraph color="$color10" flexShrink={1} fontSize={13}>
        {label}
      </Paragraph>
      <Paragraph color="$color" fontSize={13} fontWeight="600" testID={testID}>
        {value}
      </Paragraph>
    </XStack>
  );
}

/** What the card payment covers: only the added products, free cargo, the order's installments. */
export function OrderMergePaymentSummary({ session }: Props) {
  const paymentPlan =
    session.installmentCount > 1 ? `${session.installmentCount} Taksit` : 'Tek Çekim';

  return (
    <CheckoutSection title="Mevcut Siparişinize Ekleniyor">
      <YStack gap="$2.5">
        <Paragraph color="$color" fontSize={13} lineHeight={18}>
          {`Sepetinizdeki ürünler #${session.parentOrderNo} numaralı siparişinize eklenecek. Ek kargo ücreti alınmaz.`}
        </Paragraph>
        <Separator borderColor="$borderColor" />
        <SummaryRow label="Kargo" value="Ücretsiz" />
        <SummaryRow
          label={session.installmentCount > 1 ? 'Ödeme (siparişinizle aynı)' : 'Ödeme'}
          testID="order-merge-payment-plan"
          value={paymentPlan}
        />
        <XStack alignItems="center" gap="$3" justifyContent="space-between">
          <Paragraph color="$color" fontSize={14} fontWeight="700">
            Ödenecek Tutar
          </Paragraph>
          <Paragraph
            color="$color"
            fontSize={17}
            fontWeight="800"
            testID="order-merge-payment-amount"
          >
            {formatCurrency(session.amount)}
          </Paragraph>
        </XStack>
      </YStack>
    </CheckoutSection>
  );
}
