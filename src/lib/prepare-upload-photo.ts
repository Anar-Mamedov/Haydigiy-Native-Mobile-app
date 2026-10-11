import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { UPLOAD_PHOTO_JPEG_QUALITY, getUploadPhotoResize, toJpegFileName } from '@/utils/upload-photo';

/** `FormData`'ya dosya olarak eklenen fotoğraf. */
export type UploadPhoto = { uri: string; name: string; type: string };

type PickedPhoto = { uri: string; fileName?: string | null };

/**
 * Seçilen fotoğrafı backend'in kabul ettiği biçime getirir: JPEG, uzun kenar en fazla 2048 px.
 * iOS galerisi iPhone fotoğraflarını HEIC olarak verir; backend yalnızca jpg/png/webp kabul ettiği
 * için burada JPEG'e çevrilir. EXIF yönü görüntüye işlenir.
 */
export async function prepareUploadPhoto(photo: PickedPhoto): Promise<UploadPhoto> {
  const original = await ImageManipulator.manipulate(photo.uri).renderAsync();
  const resize = getUploadPhotoResize(original.width, original.height);
  const image = resize ? await ImageManipulator.manipulate(original).resize(resize).renderAsync() : original;
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: UPLOAD_PHOTO_JPEG_QUALITY });

  return { uri: result.uri, name: toJpegFileName(photo.fileName), type: 'image/jpeg' };
}
