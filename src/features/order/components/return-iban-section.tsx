import { Paragraph, XStack, YStack } from 'tamagui';
import { AppInput, AppSelect, SectionCard } from '@/components/ui';
import { formatIbanInput, getIbanDigits } from '@/utils/iban';
import { UseReturnIban } from '../hooks/use-return-iban';
import { PaymentMethod } from '@/types/order.types';

type Props = {
  iban: UseReturnIban;
  paymentMethods: PaymentMethod[];
  paymentLoading: boolean;
  paymentError: string | null;
  onAddNew: () => void;
};

/** Refund-IBAN block: pick a saved IBAN or enter a new one (bank-transfer orders). */
export function ReturnIbanSection({
  iban,
  paymentMethods,
  paymentLoading,
  paymentError,
  onAddNew,
}: Props) {
  const hasSaved = paymentMethods.length > 0 || paymentLoading;

  return (
    <SectionCard padding="$3">
      <YStack gap="$3">
        {hasSaved ? (
          <>
            <XStack alignItems="center" justifyContent="space-between">
              <Paragraph color="$color" fontSize={14} fontWeight="700">
                İade IBAN&apos;ı
              </Paragraph>
              <Paragraph
                accessibilityLabel="Yeni IBAN ekle"
                accessibilityRole="button"
                color="$brand"
                fontSize={12}
                fontWeight="700"
                onPress={onAddNew}
                pressStyle={{ opacity: 0.7 }}
              >
                Yeni IBAN ekle
              </Paragraph>
            </XStack>
            <AppSelect
              label="İade IBAN'ı"
              loading={paymentLoading}
              onValueChange={(value) => {
                iban.setSelectedIbanId(Number(value));
                iban.setIbanError(null);
              }}
              options={paymentMethods.map((method) => ({
                label: `${method.ibanName} - ${method.iban}`,
                value: method.id,
              }))}
              placeholder="İade için IBAN seçin"
              value={iban.selectedIbanId}
            />
            {paymentError ? (
              <Paragraph color="$red10" fontSize={12}>
                {paymentError}
              </Paragraph>
            ) : null}
          </>
        ) : (
          <>
            <Paragraph color="$color" fontSize={14} fontWeight="700">
              İade IBAN&apos;ı
            </Paragraph>
            <AppInput
              autoCapitalize="characters"
              helperText="Boşluklar otomatik olarak eklenecektir."
              keyboardType="number-pad"
              label="IBAN *"
              onChangeText={(text) => {
                iban.setNewIban(getIbanDigits(text));
                iban.setIbanError(null);
              }}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              value={formatIbanInput(iban.newIban)}
            />
            <AppInput
              label="IBAN Sahibi Adı *"
              maxLength={100}
              onChangeText={(text) => {
                iban.setNewIbanName(text);
                iban.setIbanError(null);
              }}
              placeholder="Ad Soyad"
              value={iban.newIbanName}
            />
          </>
        )}
        {iban.ibanError ? (
          <Paragraph color="$red10" fontSize={12}>
            {iban.ibanError}
          </Paragraph>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
