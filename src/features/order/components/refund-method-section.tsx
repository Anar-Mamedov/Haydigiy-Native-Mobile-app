import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSelect, SectionCard } from '@/components/ui';
import { CircleAlert } from '@/components/ui/icons';
import { RefundMethod } from '@/types/order.types';
import { REFUND_METHOD_GIFT_VOUCHER } from '../utils/refund-method';
import { UseRefundMethod } from '../hooks/use-refund-method';

const FIELD_LABEL = 'Geri Ödeme Yöntemi';

// Web paritesi: seçenekler yöntem adı yerine kullanıcının tercihini cümleyle söyler.
function getOptionLabel(method: RefundMethod): string {
  return method.code === REFUND_METHOD_GIFT_VOUCHER
    ? 'İademin Kupon olarak tanımlanmasını istiyorum'
    : 'İademin IBAN’ıma yapılmasını istiyorum';
}

/** Kupon seçilince IBAN'a ödeme yapılmayacağını açıkça söyleyen uyarı. */
function CouponRefundNotice() {
  return (
    <XStack
      accessibilityRole="alert"
      alignItems="flex-start"
      backgroundColor="$orange3"
      borderColor="$orange7"
      borderRadius="$4"
      borderWidth={1}
      gap="$2"
      padding="$3"
      testID="refund-method-coupon-notice"
    >
      <YStack paddingTop="$0.5">
        <CircleAlert color="$orange10" size={16} />
      </YStack>
      <Paragraph color="$orange11" flex={1} fontSize={12} fontWeight="500" lineHeight={18}>
        İade tutarınız indirim kuponu olarak tanımlanacak, bir sonraki alışverişinizde
        kullanabilirsiniz.{' '}
        <Paragraph color="$orange11" fontSize={12} fontWeight="700" lineHeight={18}>
          IBAN’ınıza herhangi bir ödeme yapılmayacaktır.
        </Paragraph>
      </Paragraph>
    </XStack>
  );
}

type Props = {
  refund: UseRefundMethod;
  loading?: boolean;
  error?: string | null;
  onSelect?: () => void;
};

/**
 * Refund-method picker for pay-on-delivery returns. Titled "Geri Ödeme Yöntemi"
 * because "İade Yöntemi" already names the cargo choice on the same screen. The
 * choice is required and starts empty, like the web `<Select>`.
 */
export function RefundMethodSection({ refund, loading = false, error = null, onSelect }: Props) {
  return (
    <SectionCard padding="$3">
      <YStack gap="$3">
        <Paragraph color="$color" fontSize={14} fontWeight="700">
          {FIELD_LABEL}{' '}
          <Paragraph color="$red10" fontSize={14} fontWeight="700">
            *
          </Paragraph>
        </Paragraph>
        <AppSelect
          label={FIELD_LABEL}
          loading={loading}
          onValueChange={(value) => {
            refund.select(Number(value));
            onSelect?.();
          }}
          options={refund.methods.map((method) => ({
            label: getOptionLabel(method),
            value: method.id,
          }))}
          placeholder="Seçiniz"
          value={refund.selectedId}
        />
        {refund.isGiftVoucher ? <CouponRefundNotice /> : null}
        {error ? (
          <Paragraph color="$red10" fontSize={12}>
            {error}
          </Paragraph>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
