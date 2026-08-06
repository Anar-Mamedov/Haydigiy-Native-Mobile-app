import { useMemo } from 'react';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CheckoutSection } from './checkout-section';
import { AppInput, AppSelect } from '@/components/ui';
import { CardFormController } from '../hooks/use-card-form';

interface CheckoutCardFormProps {
  card: CardFormController;
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const value = String(i + 1).padStart(2, '0');
  return { label: value, value };
});

export function CheckoutCardForm({ card }: CheckoutCardFormProps) {
  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, i) => {
      const year = current + i;
      return { label: String(year), value: String(year).slice(2) };
    });
  }, []);

  return (
    <CheckoutSection title="Kart Bilgileri">
      <YStack gap="$3">
        <AppInput
          autoCapitalize="characters"
          label="Kart Üzerindeki İsim"
          onChangeText={card.setOwner}
          placeholder="Kart üzerindeki isim"
          value={card.values.owner}
        />

        <AppInput
          errorMessage={
            card.isRestrictedBin ? 'Bu kartla ödeme yapılamaz. Lütfen başka bir kart kullanın.' : undefined
          }
          inputMode="numeric"
          label="Kart No"
          maxLength={19}
          onChangeText={card.setNumber}
          placeholder="0000 0000 0000 0000"
          value={card.values.number}
        />

        <XStack gap="$3">
          <YStack flex={1.4} gap="$2">
            <Paragraph color="$color" fontWeight="600">
              Son Kullanma Tarihi
            </Paragraph>
            <XStack gap="$2">
              <YStack flex={1}>
                <AppSelect
                  label="Ay"
                  onValueChange={(value) => card.setExpiryMonth(String(value))}
                  options={MONTH_OPTIONS}
                  placeholder="Ay"
                  value={card.values.expiryMonth}
                />
              </YStack>
              <YStack flex={1}>
                <AppSelect
                  label="Yıl"
                  onValueChange={(value) => card.setExpiryYear(String(value))}
                  options={yearOptions}
                  placeholder="Yıl"
                  value={card.values.expiryYear}
                />
              </YStack>
            </XStack>
          </YStack>

          <YStack flex={1} gap="$2">
            <Paragraph color="$color" fontWeight="600">
              CVV
            </Paragraph>
            <AppInput
              hideVisibleLabel
              inputMode="numeric"
              label="CVV"
              maxLength={3}
              onChangeText={card.setCvv}
              placeholder="123"
              secureTextEntry
              value={card.values.cvv}
            />
          </YStack>
        </XStack>
      </YStack>
    </CheckoutSection>
  );
}
