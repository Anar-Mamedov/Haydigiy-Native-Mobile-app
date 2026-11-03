import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { PickedMedia } from '../utils/feedback-files';
import { FEEDBACK_MEDIA_LIMITS } from '../constants/feedback-media-limits';

export type MediaPickResult = { status: 'picked'; assets: PickedMedia[] } | { status: 'cancelled' } | { status: 'denied' };

/**
 * Galeriden görsel ve video seçer. iOS seçilen videoyu 720p H.264'e dönüştürerek verir (yükleme
 * hızı ve 25 MB sınırı için); Android'de dönüştürme yoktur, sınırlar seçimden sonra denetlenir.
 */
export function useFeedbackMediaPicker() {
  return useCallback(async (selectionLimit: number): Promise<MediaPickResult> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, selectionLimit),
      quality: 1,
      videoMaxDuration: FEEDBACK_MEDIA_LIMITS.maxVideoSeconds,
      ...(Platform.OS === 'ios' ? { videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720 } : {}),
    });
    if (result.canceled || !result.assets?.length) return { status: 'cancelled' };
    return { status: 'picked', assets: result.assets };
  }, []);
}
