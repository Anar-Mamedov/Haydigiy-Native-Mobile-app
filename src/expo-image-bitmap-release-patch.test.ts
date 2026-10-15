/* eslint-disable @typescript-eslint/no-require-imports */
import packageJson from '../package.json';

/**
 * Play Console "arka plan bit eşlem bellek kullanımı" uyarısı (kötü davranış eşiği 200 MB,
 * son tarih Şubat 2027) için expo-image'a `patches/` altından uygulanan yamanın koruması.
 *
 * Google, UI gizlenince (TRIM_MEMORY_UI_HIDDEN) büyük bitmap'lerin bırakılmasını bekliyor;
 * expo-image/Glide ise yalnızca bellek önbelleğinin yarısını boşaltıyor, ekrandaki ve
 * navigasyon yığınının altındaki ekranlardaki görselleri tutmaya devam ediyordu. Yama
 * ekranda görünmeyen görselleri bırakır ve uygulama öne gelince yeniden yükler.
 *
 * İki şekilde sessizce devre dışı kalabilir; bu testler ikisini de yakalar:
 * - expo-image güncellenip yama dosyası yeni sürüme taşınmazsa patch-package yamayı
 *   uygulamayabilir.
 * - Expo SDK 53'ten beri Android modülleri hazır derlenmiş AAR olarak geliyor; modül
 *   `buildFromSource` listesinde değilse yamalı kaynak hiç derlenmez:
 *   https://docs.expo.dev/guides/prebuilt-expo-modules/
 */

// Projede @types/node yok; testin kullandığı Node API'leri kadar tip tanımı yeterli.
declare const __dirname: string;
const fs: {
  existsSync(filePath: string): boolean;
  readFileSync(filePath: string, encoding: 'utf8'): string;
} = require('fs');
const path: { join(...segments: string[]): string } = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const EXPO_IMAGE_ROOT = path.join(PROJECT_ROOT, 'node_modules', 'expo-image');
const ANDROID_SOURCE_DIR = path.join(EXPO_IMAGE_ROOT, 'android/src/main/java/expo/modules/image');

function readAndroidSource(fileName: string): string {
  return fs.readFileSync(path.join(ANDROID_SOURCE_DIR, fileName), 'utf8');
}

describe('expo-image background bitmap release patch', () => {
  it('is named after the installed expo-image version', () => {
    const { version } = require(path.join(EXPO_IMAGE_ROOT, 'package.json'));

    expect(fs.existsSync(path.join(PROJECT_ROOT, 'patches', `expo-image+${version}.patch`))).toBe(
      true,
    );
  });

  it('builds expo-image from source on Android so the patch is compiled', () => {
    expect(packageJson.expo.autolinking.android.buildFromSource).toContain('expo-image');
  });

  it('releases off-screen bitmaps when the UI is hidden', () => {
    const releaser = readAndroidSource('UiHiddenBitmapReleaser.kt');

    expect(releaser).toContain('level < ComponentCallbacks2.TRIM_MEMORY_UI_HIDDEN');
    expect(releaser).toContain('ExpoImageViewRegistry.forEach { it.releaseBitmapIfOffScreen() }');
    expect(releaser).toContain('Glide.get(applicationContext).clearMemory()');
  });

  it('registers the releaser and restores bitmaps when the app returns to the foreground', () => {
    const imageModule = readAndroidSource('ExpoImageModule.kt');

    expect(imageModule).toContain('UiHiddenBitmapReleaser(context.applicationContext)');
    expect(imageModule).toMatch(
      /OnActivityEntersForeground \{\s*uiHiddenBitmapReleaser\?\.onUiVisible\(\)/,
    );
  });

  it('tracks every image view and reloads released images once they are attached again', () => {
    const imageView = readAndroidSource('ExpoImageViewWrapper.kt');

    expect(imageView).toContain('ExpoImageViewRegistry.register(this)');
    expect(imageView).toContain('ExpoImageViewRegistry.unregister(this)');
    expect(imageView).toMatch(/override fun onAttachedToWindow\(\) \{[\s\S]*?restoreReleasedBitmap\(\)/);
  });
});
