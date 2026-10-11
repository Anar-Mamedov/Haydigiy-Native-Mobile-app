import { Image } from 'expo-image';
import { Image as ImagePlaceholderIcon } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppCheckbox, AppSelect } from '@/components/ui';
import { PHOTO_REQUIRED_REASON_ID, ExpandedReturnItem } from '../hooks/use-return-create-controller';
import { ReturnPhoto, ReturnReason } from '@/types/order.types';
import { ReturnPhotoField } from './return-photo-field';

const THUMB_SIZE = 64;

type Props = {
  row: ExpandedReturnItem;
  selected: boolean;
  reasonId?: number;
  photo?: ReturnPhoto;
  reasons: ReturnReason[];
  reasonsLoading: boolean;
  reasonsError: string | null;
  onToggle: () => void;
  onReasonChange: (reasonId: number) => void;
  onPhotoChange: (photo: ReturnPhoto | null) => void;
};

/**
 * İade edilebilir tek bir birim: seçim, iade nedeni ve gerekiyorsa fotoğraf.
 *
 * Paket bileşenleri de bu satırla basılır; paketin başlığı ve "tamamını seç"
 * kutusu `OrderItemGroupCard`'ın işidir.
 */
export function ReturnItemRow({
  row,
  selected,
  reasonId,
  photo,
  reasons,
  reasonsLoading,
  reasonsError,
  onToggle,
  onReasonChange,
  onPhotoChange,
}: Props) {
  const { item } = row;
  const requiresPhoto = reasonId === PHOTO_REQUIRED_REASON_ID;

  return (
    <YStack
      borderColor={selected ? '$brand' : '$borderColor'}
      borderRadius="$4"
      borderWidth={1}
      gap="$3"
      padding="$3"
    >
      <XStack alignItems="flex-start" gap="$3">
        <AppCheckbox
          accessibilityLabel={`${item.name} ürününü iade için seç`}
          checked={selected}
          onChange={onToggle}
          size={22}
        />
        <YStack
          alignItems="center"
          backgroundColor="$backgroundHover"
          borderColor="$borderColor"
          borderRadius="$3"
          borderWidth={1}
          height={THUMB_SIZE}
          justifyContent="center"
          overflow="hidden"
          width={THUMB_SIZE}
        >
          {item.image ? (
            <Image contentFit="contain" source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <ImagePlaceholderIcon color="$color9" size={24} />
          )}
        </YStack>
        <YStack flex={1} gap="$1">
          <Paragraph color="$color" fontSize={14} fontWeight="600" numberOfLines={2}>
            {item.name}
          </Paragraph>
          {item.variantName ? (
            <Paragraph color="$color10" fontSize={12}>
              Beden: <Paragraph color="$color" fontSize={12} fontWeight="600">{item.variantName}</Paragraph>
            </Paragraph>
          ) : null}
        </YStack>
      </XStack>

      {selected ? (
        <YStack gap="$3">
          <YStack gap="$1.5">
            <Paragraph color="$color10" fontSize={12}>
              İade Nedeni
            </Paragraph>
            <AppSelect
              label="İade Nedeni"
              loading={reasonsLoading}
              onValueChange={(value) => onReasonChange(Number(value))}
              options={reasons.map((reason) => ({ label: reason.name, value: reason.id }))}
              placeholder={reasonsError ?? 'Seçiniz'}
              value={reasonId ?? null}
            />
          </YStack>

          {requiresPhoto ? <ReturnPhotoField onPhotoChange={onPhotoChange} photo={photo} /> : null}
        </YStack>
      ) : null}
    </YStack>
  );
}
