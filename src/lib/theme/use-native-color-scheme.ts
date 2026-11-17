import { useEffect } from 'react';
import { Appearance } from 'react-native';
import type { ThemePreference } from '@/components/ui/theme-toggle';

type NativeColorScheme = Parameters<typeof Appearance.setColorScheme>[0];

/**
 * Uygulamanın tema tercihini native katmanın renk şemasına çevirir. `system` tercihi native
 * katmanı serbest bırakır (`unspecified`), diğerleri onu tercihe sabitler.
 */
export function toNativeColorScheme(themePreference: ThemePreference): NativeColorScheme {
  return themePreference === 'system' ? 'unspecified' : themePreference;
}

/**
 * Native katmanı (klavye, sistem diyalogları, metin alanlarının native varsayılan yazı ve
 * placeholder renkleri, yenileme göstergesi, WebView `prefers-color-scheme`) uygulamanın
 * temasına bağlar. Bağlanmazsa native katman telefonun koyu modunu izler ve uygulama açık
 * temadayken açık zeminde beyaz yazı ya da koyu klavye çıkar (HMA-65).
 *
 * `userInterfaceStyle` (app.json) aynı sabitlemeyi açılışta native olarak yapar ama yalnız yeni
 * mağaza build'ine yansır; bu hook JS'te çalıştığı için OTA ile mevcut build'lere de ulaşır.
 * iOS'ta açık pencerelerin `overrideUserInterfaceStyle`'ını, Android'de
 * `AppCompatDelegate.setDefaultNightMode`'u ayarlar.
 */
export function useNativeColorScheme(themePreference: ThemePreference) {
  useEffect(() => {
    Appearance.setColorScheme(toNativeColorScheme(themePreference));
  }, [themePreference]);
}
