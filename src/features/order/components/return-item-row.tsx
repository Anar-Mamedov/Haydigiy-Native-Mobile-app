import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, Image as ImagePlaceholderIcon, X } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { AppCheckbox, AppSelect } from '@/components/ui';
import { PHOTO_REQUIRED_REASON_ID, ExpandedReturnItem } from '../hooks/use-return-create-controller';
import { ReturnPhoto, ReturnReason } from '@/types/order.types';

const THUMB_SIZE = 64;

type Props = {
  entry: ExpandedReturnItem;
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

/** A single returnable order line: select, pick a reason, and attach a photo. */
export function ReturnItemRow({
  entry,
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
  const { item } = entry;
  const requiresPhoto = reasonId === PHOTO_REQUIRED_REASON_ID;

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    const asset = result.canceled ? undefined : result.assets[0];
    if (asset) {
      onPhotoChange({
        uri: asset.uri,
        name: asset.fileName ?? 'return.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

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

          {requiresPhoto ? (
            <YStack gap="$2">
              <Paragraph color="$color10" fontSize={12}>
                Fotoğraf yükleyin <Paragraph color="$red10" fontSize={12}>*</Paragraph>
              </Paragraph>
              {photo ? (
                <XStack alignItems="center" gap="$3">
                  <Image
                    contentFit="cover"
                    source={{ uri: photo.uri }}
                    style={{ width: 56, height: 56, borderRadius: 8 }}
                  />
                  <XStack
                    accessibilityLabel="Fotoğrafı kaldır"
                    accessibilityRole="button"
                    alignItems="center"
                    gap="$1.5"
                    onPress={() => onPhotoChange(null)}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <X color="$red10" size={16} />
                    <Paragraph color="$red10" fontSize={13} fontWeight="600">
                      Kaldır
                    </Paragraph>
                  </XStack>
                </XStack>
              ) : (
                <XStack
                  accessibilityLabel="Fotoğraf yükle"
                  accessibilityRole="button"
                  alignItems="center"
                  alignSelf="flex-start"
                  backgroundColor="$background"
                  borderColor="$brand"
                  borderRadius="$3"
                  borderWidth={1}
                  gap="$2"
                  onPress={pickPhoto}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  pressStyle={{ backgroundColor: '$backgroundHover' }}
                >
                  <Camera color="$brand" size={16} />
                  <Paragraph color="$brand" fontSize={13} fontWeight="700">
                    Fotoğraf Yükle
                  </Paragraph>
                </XStack>
              )}
              {!photo ? (
                <Paragraph color="$red10" fontSize={11}>
                  Bu iade nedeni için fotoğraf zorunludur.
                </Paragraph>
              ) : null}
            </YStack>
          ) : null}
        </YStack>
      ) : null}
    </YStack>
  );
}
