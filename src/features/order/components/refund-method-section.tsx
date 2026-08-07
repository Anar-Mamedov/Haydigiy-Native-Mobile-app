import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard, SelectableCard } from '@/components/ui';
import { REFUND_METHOD_GIFT_VOUCHER, REFUND_METHOD_IBAN } from '../utils/refund-method';
import { UseRefundMethod } from '../hooks/use-refund-method';

// The endpoint only returns id/name/code, so the explanations live here.
const METHOD_DESCRIPTIONS: Record<string, string> = {
  [REFUND_METHOD_IBAN]: 'İade onaylandığında tutar IBAN’ınıza aktarılır.',
  [REFUND_METHOD_GIFT_VOUCHER]: 'İade onaylandığında size özel indirim kuponu tanımlanır.',
};

type Props = {
  refund: UseRefundMethod;
  loading?: boolean;
  error?: string | null;
  onSelect?: () => void;
};

/**
 * Refund-method picker for pay-on-delivery returns. Titled "Geri Ödeme Yöntemi"
 * because "İade Yöntemi" already names the cargo choice on the same screen.
 */
export function RefundMethodSection({ refund, loading = false, error = null, onSelect }: Props) {
  return (
    <SectionCard padding="$3">
      <YStack gap="$3">
        <Paragraph color="$color" fontSize={14} fontWeight="700">
          Geri Ödeme Yöntemi
        </Paragraph>
        {refund.methods.map((method) => (
          <SelectableCard
            description={METHOD_DESCRIPTIONS[method.code]}
            disabled={loading}
            key={method.id}
            onPress={() => {
              refund.select(method.id);
              onSelect?.();
            }}
            selected={method.id === refund.selectedId}
            testID={`refund-method-${method.code}`}
            title={method.name}
          />
        ))}
        {error ? (
          <Paragraph color="$red10" fontSize={12}>
            {error}
          </Paragraph>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
