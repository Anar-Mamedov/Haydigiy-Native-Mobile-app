/* eslint-disable @typescript-eslint/no-require-imports */
import packageJson from '../package.json';

/**
 * `@expo/ui`'in native ExpoUI modülü Android autolinking'den çıkarıldı: uygulama onu hiç
 * kullanmıyor ama expo-router getirdiği için her açılışta tanımı ~65 ms sürüyordu
 * (Android vitals: yavaş sıcak başlatma). Modül olmadan `@expo/ui/jetpack-compose`
 * içe aktarıldığı anda `requireNativeModule('ExpoUI')` hata fırlatır; expo-router'ın
 * Android araç çubuğu dosyaları onu patches/expo-router+*.patch ile ilk çizimde yükler.
 * İkisi birlikte geçerli: biri kalkarsa uygulama açılışta çöker.
 */
const EXPO_ROUTER_ANDROID_TOOLBAR_MODULES = [
  'expo-router/build/toolbar/native.android.js',
  'expo-router/build/toolbar/AnimatedItemContainer.android.js',
  'expo-router/build/layouts/stack-utils/toolbar/ToolbarItemBadge.android.js',
  'expo-router/build/layouts/stack-utils/toolbar/processHeaderItemsForPlatform.android.js',
  'expo-router/build/layouts/stack-utils/toolbar/StackToolbarButton/native.android.js',
  'expo-router/build/layouts/stack-utils/toolbar/StackToolbarMenu/native.android.js',
  'expo-router/build/layouts/stack-utils/toolbar/StackToolbarSpacer/native.android.js',
  'expo-router/build/layouts/stack-utils/toolbar/StackToolbarView/native.android.js',
];

jest.mock('@expo/ui/jetpack-compose', () => {
  throw new Error('@expo/ui/jetpack-compose was loaded at import time');
});

describe('@expo/ui on Android', () => {
  it('is excluded from Android autolinking only', () => {
    expect(packageJson.expo.autolinking.android.exclude).toContain('@expo/ui');
    expect(packageJson.expo.autolinking).not.toHaveProperty('exclude');
  });

  it.each(EXPO_ROUTER_ANDROID_TOOLBAR_MODULES)('is not loaded when %s is imported', (modulePath) => {
    expect(() => require(modulePath)).not.toThrow();
  });
});
