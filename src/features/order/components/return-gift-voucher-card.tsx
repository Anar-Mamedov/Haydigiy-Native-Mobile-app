import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CopyField } from '@/components/ui/copy-field';
import { Gift } from '@/components/ui/icons';
import { isGiftVoucherRefund } from '../utils/refund-method';
import { formatOrderPrice } from '../utils/order-status';
import { ReturnPaymentInfo } from '@/types/order.types';

type Props = {
  info: ReturnPaymentInfo | null;
};

/**
 * Shows the coupon created for a gift-voucher refund. The backend issues it only
 * after WMS approves the return, so this stays hidden until then; IBAN refunds
 * never render it.
 */
export function ReturnGiftVoucherCard({ info }: Props) {
  if (!isGiftVoucherRefund(info) || !info) return null;

  return (
    <YStack
      backgroundColor="$orange2"
      borderColor="$orange6"
      borderRadius="$6"
      borderWidth={1}
      gap="$3"
      padding="$3"
      testID="return-gift-voucher-card"
    >
      <XStack alignItems="center" gap="$2">
        <Gift color="$brand" size={18} />
        <Paragraph color="$brand" flex={1} fontSize={15} fontWeight="700">
          {info.message ?? 'İade kuponunuz oluşturuldu'}
        </Paragraph>
      </XStack>

      {info.couponCode ? (
        <CopyField
          accessibilityLabel={`${info.couponCode} kupon kodunu kopyala`}
          label="KUPON KODU"
          value={info.couponCode}
        />
      ) : null}

      <YStack gap="$1">
        {info.amount != null ? (
          <Paragraph color="$color" fontSize={13}>
            Kupon tutarı: {formatOrderPrice(info.amount)}
          </Paragraph>
        ) : null}
        {info.expiresAt ? (
          <Paragraph color="$color10" fontSize={13}>
            Son kullanma: {info.expiresAt}
          </Paragraph>
        ) : null}
      </YStack>
    </YStack>
  );
}
