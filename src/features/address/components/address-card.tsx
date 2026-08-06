import { Pencil, Trash2 } from '@/components/ui/icons';
import { Separator, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui';
import { formatTurkishPhoneDisplay } from '@/utils/turkish-phone';
import { Address } from '@/types/address.types';

type AddressCardProps = {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
};

/** Single saved-address card with edit/delete actions, mirroring the web list. */
export function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  const fullName = `${address.name} ${address.surname}`.trim();
  const locality = [address.district, address.neighbourhood].filter(Boolean).join(', ');
  const phone = formatTurkishPhoneDisplay(address.phone);

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
        <Paragraph color="$brand" flex={1} fontSize={15} fontWeight="800" numberOfLines={1}>
          {address.title}
        </Paragraph>
        <XStack gap="$4">
          <XStack
            accessibilityLabel="Adresi düzenle"
            accessibilityRole="button"
            alignItems="center"
            gap="$1.5"
            hitSlop={8}
            onPress={onEdit}
            pressStyle={{ opacity: 0.6 }}
          >
            <Pencil color="$brand" size={15} />
            <Paragraph color="$brand" fontSize={13} fontWeight="600">
              Düzenle
            </Paragraph>
          </XStack>
          <XStack
            accessibilityLabel="Adresi sil"
            accessibilityRole="button"
            alignItems="center"
            gap="$1.5"
            hitSlop={8}
            onPress={onDelete}
            pressStyle={{ opacity: 0.6 }}
          >
            <Trash2 color="$red10" size={15} />
            <Paragraph color="$red10" fontSize={13} fontWeight="600">
              Sil
            </Paragraph>
          </XStack>
        </XStack>
      </XStack>

      <Separator borderColor="$borderColor" />

      <YStack gap="$1" paddingHorizontal="$4" paddingVertical="$3">
        {fullName ? (
          <Paragraph color="$color" fontSize={14} fontWeight="700">
            {fullName}
          </Paragraph>
        ) : null}
        {address.city ? (
          <Paragraph color="$color11" fontSize={13}>
            {address.city}
          </Paragraph>
        ) : null}
        {locality ? (
          <Paragraph color="$color11" fontSize={13}>
            {locality}
          </Paragraph>
        ) : null}
        {address.addressLine ? (
          <Paragraph color="$color" fontSize={13} lineHeight={19}>
            {address.addressLine}
          </Paragraph>
        ) : null}
        {phone ? (
          <Paragraph color="$color11" fontSize={13}>
            {phone}
          </Paragraph>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
