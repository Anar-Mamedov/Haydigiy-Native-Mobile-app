import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { prepareUploadPhoto } from '@/lib/prepare-upload-photo';
import { ReturnPhoto } from '@/types/order.types';

export const RETURN_PHOTO_ERROR_MESSAGE = 'Fotoğraf işlenemedi. Lütfen başka bir fotoğraf seçin.';

/**
 * Galeriden iade fotoğrafı seçer ve yüklemeye hazırlar (HEIC → JPEG, küçültme).
 * Fotoğraf yalnızca hazır olduğunda `onPhotoChange` ile iletilir.
 */
export function useReturnPhotoPicker(onPhotoChange: (photo: ReturnPhoto) => void) {
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    // Orijinal dosya alınır; sıkıştırma ve JPEG'e çevirme tek seferde `prepareUploadPhoto` içinde yapılır.
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return;

    setError(null);
    setPreparing(true);
    try {
      onPhotoChange(await prepareUploadPhoto(asset));
    } catch (cause) {
      console.warn('[return-photo] prepare failed', cause);
      setError(RETURN_PHOTO_ERROR_MESSAGE);
    } finally {
      setPreparing(false);
    }
  };

  return { pickPhoto, preparing, error };
}
