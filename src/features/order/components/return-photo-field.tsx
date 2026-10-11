import { Image } from 'expo-image';
import { Spinner, XStack, YStack } from 'tamagui';
import { Camera, X } from '@/components/ui/icons';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ReturnPhoto } from '@/types/order.types';
import { useReturnPhotoPicker } from '../hooks/use-return-photo-picker';

type Props = {
  photo?: ReturnPhoto;
  onPhotoChange: (photo: ReturnPhoto | null) => void;
};

/** Fotoğraf zorunlu iade nedeni için yükleme alanı: önizleme/kaldır, yükle, hazırlanıyor ve hata durumları. */
export function ReturnPhotoField({ photo, onPhotoChange }: Props) {
  const { pickPhoto, preparing, error } = useReturnPhotoPicker(onPhotoChange);

  return (
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
      ) : preparing ? (
        <XStack accessibilityLiveRegion="polite" alignItems="center" gap="$2">
          <Spinner color="$brand" size="small" />
          <Paragraph color="$color10" fontSize={13}>
            Fotoğraf hazırlanıyor...
          </Paragraph>
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
      {!photo && !preparing ? (
        <Paragraph color="$red10" fontSize={11}>
          {error ?? 'Bu iade nedeni için fotoğraf zorunludur.'}
        </Paragraph>
      ) : null}
    </YStack>
  );
}
