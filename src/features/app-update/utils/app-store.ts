import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export type AppStorePlatform = 'android' | 'ios';

export const APP_STORE_URLS: Record<AppStorePlatform, string> = {
  android: 'https://play.google.com/store/apps/details?id=com.faprika.haydigiy',
  ios: 'https://apps.apple.com/app/id6450927928',
};

export function getCurrentStorePlatform(): AppStorePlatform | null {
  const platform = process.env.EXPO_OS ?? Platform.OS;
  return platform === 'android' || platform === 'ios' ? platform : null;
}

export function getAppStoreUrl(platform = getCurrentStorePlatform()): string | null {
  return platform ? APP_STORE_URLS[platform] : null;
}

/** Opens this application's listing in the store for the current native platform. */
export async function openAppStore(platform = getCurrentStorePlatform()): Promise<void> {
  const storeUrl = getAppStoreUrl(platform);
  if (!storeUrl) {
    throw new Error('Bu platform için uygulama mağazası bağlantısı bulunamadı.');
  }

  await Linking.openURL(storeUrl);
}
