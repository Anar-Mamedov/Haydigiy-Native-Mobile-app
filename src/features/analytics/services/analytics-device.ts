import { Dimensions, Platform } from 'react-native';
import * as Application from 'expo-application';

/**
 * Cihaz/uygulama bağlamı. Web'deki `getDeviceType`/`getBrowser`/`getOS`
 * üçlüsünün native karşılığı: tarayıcı kavramı olmadığı için `browser` alanı
 * yerine uygulama sürümü taşınır.
 */

export type AnalyticsDeviceInfo = {
  deviceType: 'mobile' | 'tablet';
  os: 'iOS' | 'Android' | 'Other';
  osVersion: string;
  appVersion: string;
  screenWidth: number;
  screenHeight: number;
};

/** Web ile aynı eşik: 768px altı telefon, üstü tablet. */
export const TABLET_MIN_WIDTH = 768;

export function resolveDeviceType(shortestSide: number): 'mobile' | 'tablet' {
  return shortestSide >= TABLET_MIN_WIDTH ? 'tablet' : 'mobile';
}

export function resolveOsName(platform: string): AnalyticsDeviceInfo['os'] {
  if (platform === 'ios') return 'iOS';
  if (platform === 'android') return 'Android';
  return 'Other';
}

/**
 * Ekran döndürülebildiği için cihaz sınıfı genişlikten değil **kısa kenardan**
 * türetilir; aksi halde yatay tutulan telefon tablet sayılırdı.
 */
export function getAnalyticsDeviceInfo(): AnalyticsDeviceInfo {
  const { width, height } = Dimensions.get('window');
  const shortestSide = Math.min(width, height);

  return {
    deviceType: resolveDeviceType(shortestSide),
    os: resolveOsName(Platform.OS),
    osVersion: String(Platform.Version ?? ''),
    appVersion: Application.nativeApplicationVersion ?? '',
    screenWidth: Math.round(width),
    screenHeight: Math.round(height),
  };
}
