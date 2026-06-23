import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Paragraph, XStack, YStack } from 'tamagui';
import { AppCheckbox, AppInput } from '@/components/ui';
import { AddressFormData } from '../schemas/address.schema';

type InvoiceFieldsProps = {
  control: Control<AddressFormData>;
  errors: FieldErrors<AddressFormData>;
};

/** Corporate-only invoice fields (VKN/TCKN, Vergi Dairesi, Firma Adı, e-fatura). */
export function InvoiceFields({ control, errors }: InvoiceFieldsProps) {
  return (
    <YStack gap="$4">
      <XStack gap="$3">
        <YStack flex={1}>
          <Controller
            control={control}
            name="taxNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                errorMessage={errors.taxNumber?.message}
                keyboardType="number-pad"
                label="VKN/TCKN *"
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.replace(/\D/g, ''))}
                placeholder="VKN/TCKN Giriniz"
                value={value}
              />
            )}
          />
        </YStack>
        <YStack flex={1}>
          <Controller
            control={control}
            name="taxOffice"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                errorMessage={errors.taxOffice?.message}
                label="Vergi Dairesi *"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Vergi Dairesi Giriniz"
                value={value}
              />
            )}
          />
        </YStack>
      </XStack>

      <Controller
        control={control}
        name="companyName"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            errorMessage={errors.companyName?.message}
            label="Firma Adı *"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Firma Adı Giriniz"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="isEFatura"
        render={({ field: { onChange, value } }) => (
          <AppCheckbox
            accessibilityLabel="E-fatura mükellefiyim"
            checked={value}
            onChange={() => onChange(!value)}
          >
            <Paragraph color="$color" fontSize={13}>
              E-fatura mükellefiyim
            </Paragraph>
          </AppCheckbox>
        )}
      />
    </YStack>
  );
}
