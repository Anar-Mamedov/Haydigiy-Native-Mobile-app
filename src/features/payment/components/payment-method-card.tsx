import { Pencil, Trash2 } from '@tamagui/lucide-icons-2';
import { Paragraph, Separator, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';
import { formatIbanInput, getIbanDigits } from '@/utils/iban';
import { PaymentMethod } from '@/types/order.types';

type PaymentMethodCardProps = {
  method: PaymentMethod;
  onEdit: () => void;
  onDelete: () => void;
};

/** Single saved-IBAN card with default badge and edit/delete actions. */
export function PaymentMethodCard({ method, onEdit, onDelete }: PaymentMethodCardProps) {
  const formattedIban = formatIbanInput(getIbanDigits(method.iban));

  return (
    <SectionCard elevated padding={0}>
      <XStack
        alignItems="center"
        backgroundColor="$backgroundHover"
        borderTopLeftRadius="$7"
        borderTopRightRadius="$7"
        gap="$2"
        justifyContent="space-between"
        paddingHorizontal="$4"
        paddingVertical="$3"
      >
        <Paragraph color="$color" flex={1} fontSize={15} fontWeight="700" numberOfLines={1}>
          {method.ibanName}
        </Paragraph>
        {method.isDefault ? (
          <XStack backgroundColor="$brand" borderRadius="$2" paddingHorizontal="$2" paddingVertical="$1">
            <Paragraph color="white" fontSize={11} fontWeight="700">
              Varsayılan
            </Paragraph>
          </XStack>
        ) : null}
      </XStack>

      <Separator borderColor="$borderColor" />

      <YStack gap="$3" paddingHorizontal="$4" paddingVertical="$3">
        <YStack gap="$1">
          <Paragraph color="$color10" fontSize={12}>
            IBAN
          </Paragraph>
          <Paragraph color="$color" fontSize={15} fontWeight="600" letterSpacing={0.5}>
            {formattedIban}
          </Paragraph>
        </YStack>

        <XStack gap="$3">
          <XStack
            accessibilityLabel="IBAN düzenle"
            accessibilityRole="button"
            alignItems="center"
            borderColor="$brand"
            borderRadius="$4"
            borderWidth={1}
            flex={1}
            gap="$1.5"
            height={40}
            justifyContent="center"
            onPress={onEdit}
            pressStyle={{ opacity: 0.7 }}
          >
            <Pencil color="$brand" size={15} />
            <Paragraph color="$brand" fontSize={13} fontWeight="600">
              Düzenle
            </Paragraph>
          </XStack>
          <XStack
            accessibilityLabel="IBAN sil"
            accessibilityRole="button"
            alignItems="center"
            borderColor="$red8"
            borderRadius="$4"
            borderWidth={1}
            flex={1}
            gap="$1.5"
            height={40}
            justifyContent="center"
            onPress={onDelete}
            pressStyle={{ opacity: 0.7 }}
          >
            <Trash2 color="$red10" size={15} />
            <Paragraph color="$red10" fontSize={13} fontWeight="600">
              Sil
            </Paragraph>
          </XStack>
        </XStack>
      </YStack>
    </SectionCard>
  );
}
