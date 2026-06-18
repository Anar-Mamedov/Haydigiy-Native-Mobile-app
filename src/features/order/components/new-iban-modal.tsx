import { useState } from 'react';
import { Button, Paragraph, Sheet, XStack, YStack } from 'tamagui';
import { AppCheckbox, AppInput } from '@/components/ui';
import { useAddPaymentMethodMutation } from '../api/return.mutations';
import { formatIbanInput, getIbanDigits, isValidIban, normalizeIban } from '../utils/iban';
import { getReturnErrorMessage } from '@/services/return.service';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

/** Adds a new refund IBAN (`POST /payment-methods`) from within the return flow. */
export function NewIbanModal({ open, onClose, onSuccess }: Props) {
  const [iban, setIban] = useState('');
  const [ibanName, setIbanName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addMutation = useAddPaymentMethodMutation();

  const reset = () => {
    setIban('');
    setIbanName('');
    setIsDefault(false);
    setError(null);
  };

  const handleClose = () => {
    if (addMutation.isPending) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValidIban(iban)) {
      setError('Geçerli bir IBAN giriniz.');
      return;
    }
    if (!ibanName.trim()) {
      setError('IBAN sahibi adı gereklidir.');
      return;
    }
    setError(null);
    try {
      await addMutation.mutateAsync({
        iban: normalizeIban(iban),
        ibanName: ibanName.trim(),
        isDefault,
      });
      reset();
      onSuccess();
    } catch (submitError) {
      setError(getReturnErrorMessage(submitError, 'IBAN eklenemedi.'));
    }
  };

  return (
    <Sheet
      dismissOnOverlayPress
      modal
      onOpenChange={(next: boolean) => !next && handleClose()}
      open={open}
      snapPointsMode="fit"
    >
      <Sheet.Overlay backgroundColor="$shadowColor" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} opacity={0.5} />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <YStack gap="$3" padding="$5">
          <Paragraph color="$color" fontSize={17} fontWeight="800">
            Yeni IBAN Ekle
          </Paragraph>
          <AppInput
            autoCapitalize="characters"
            helperText="Boşluklar otomatik olarak eklenecektir."
            keyboardType="number-pad"
            label="IBAN *"
            onChangeText={(text) => {
              setIban(getIbanDigits(text));
              setError(null);
            }}
            placeholder="TR00 0000 0000 0000 0000 0000 00"
            value={formatIbanInput(iban)}
          />
          <AppInput
            label="IBAN Sahibi Adı *"
            maxLength={100}
            onChangeText={(text) => {
              setIbanName(text);
              setError(null);
            }}
            placeholder="Ad Soyad"
            value={ibanName}
          />
          <AppCheckbox
            accessibilityLabel="Varsayılan IBAN yap"
            checked={isDefault}
            onChange={() => setIsDefault((prev) => !prev)}
          >
            <Paragraph color="$color" fontSize={13}>
              Varsayılan IBAN yap
            </Paragraph>
          </AppCheckbox>
          {error ? (
            <Paragraph color="$red10" fontSize={12}>
              {error}
            </Paragraph>
          ) : null}
          <XStack gap="$3" paddingTop="$1">
            <Button
              backgroundColor="$background"
              borderColor="$borderColor"
              borderRadius="$4"
              borderWidth={1}
              disabled={addMutation.isPending}
              flex={1}
              height={46}
              onPress={handleClose}
              pressStyle={{ backgroundColor: '$backgroundHover' }}
            >
              <Paragraph color="$color" fontWeight="600">
                Vazgeç
              </Paragraph>
            </Button>
            <Button
              backgroundColor="$brand"
              borderRadius="$4"
              disabled={addMutation.isPending}
              flex={1}
              height={46}
              onPress={handleSubmit}
              opacity={addMutation.isPending ? 0.7 : 1}
              pressStyle={{ opacity: 0.85 }}
            >
              <Paragraph color="white" fontWeight="700">
                {addMutation.isPending ? 'Ekleniyor...' : 'Kaydet'}
              </Paragraph>
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
