import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { formatIbanForDisplay } from '@/utils/iban';
import type { ReturnRefundIban } from '../utils/return-groups';

type ReturnIbanInfoProps = {
  refundIban: ReturnRefundIban;
};

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <Paragraph color="$brand" fontSize={12} lineHeight={17} selectable>
      <Paragraph color="$brand" fontSize={12} fontWeight="700">
        {label}:
      </Paragraph>{' '}
      {value}
    </Paragraph>
  );
}

/**
 * Beklemedeki iade talebinde geri ödemenin yapılacağı IBAN ve sahibi (web
 * `ReturnIbanInfo`). Müşteri talebi oluştururken seçtiği hesabı burada görür.
 */
export function ReturnIbanInfo({ refundIban }: ReturnIbanInfoProps) {
  const { iban, ibanName } = refundIban;
  if (!iban && !ibanName) return null;

  return (
    <YStack
      backgroundColor="$orange2"
      borderColor="$orange6"
      borderRadius="$4"
      borderWidth={1}
      gap="$1"
      paddingHorizontal="$3"
      paddingVertical="$2"
      testID="return-iban-info"
    >
      {ibanName ? <InfoLine label="IBAN sahibi" value={ibanName} /> : null}
      {iban ? <InfoLine label="IBAN" value={formatIbanForDisplay(iban)} /> : null}
    </YStack>
  );
}
