import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppCheckbox } from '@/components/ui';

export const DEFAULT_ADDRESS_LABEL = 'Varsayılan adres olarak kullan';
const DEFAULT_ADDRESS_HINT = 'Siparişlerde bu adres öncelikli olarak seçilir.';

type DefaultAddressFieldProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
};

/** Adres formundaki "Varsayılan adres olarak kullan" kutusu (web adres formları paritesi). */
export function DefaultAddressField({ checked, onChange }: DefaultAddressFieldProps) {
  return (
    <YStack
      backgroundColor="$backgroundHover"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      padding="$3"
    >
      <AppCheckbox accessibilityLabel={DEFAULT_ADDRESS_LABEL} checked={checked} onChange={onChange}>
        <YStack gap="$1">
          <Paragraph color="$color" fontSize={14} fontWeight="600">
            {DEFAULT_ADDRESS_LABEL}
          </Paragraph>
          <Paragraph color="$color10" fontSize={12}>
            {DEFAULT_ADDRESS_HINT}
          </Paragraph>
        </YStack>
      </AppCheckbox>
    </YStack>
  );
}
