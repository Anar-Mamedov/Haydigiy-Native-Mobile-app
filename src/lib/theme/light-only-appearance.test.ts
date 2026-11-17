import appJson from '../../../app.json';
import { config } from '../../../tamagui.config';

function getSplashPluginOptions(): Record<string, unknown> {
  const entry = appJson.expo.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen');
  if (!Array.isArray(entry)) {
    throw new Error('expo-splash-screen plugin is not configured in app.json');
  }
  return entry[1] as Record<string, unknown>;
}

// Koyu mod kaldırıldı: telefon koyu moda geçse de uygulama açık temada kalmalı.
describe('light-only appearance', () => {
  // iOS'ta `fastSchemeChange` açıkken renkler DynamicColorIOS olur ve sistem koyu moda geçince
  // uygulamanın tema seçiminden bağımsız olarak koyuya döner.
  it('does not let Tamagui hand theme colors to iOS as dynamic system colors', () => {
    expect(config.settings.fastSchemeChange).toBe(false);
  });

  it('pins the native interface style to light', () => {
    expect(appJson.expo.userInterfaceStyle).toBe('light');
  });

  // HMA-65: splash ayarında `dark` varken expo-splash-screen prebuild'de iOS Info.plist'e
  // `UIUserInterfaceStyle = Automatic` yazıp yukarıdaki `light` sabitlemesini eziyor (Android'de de
  // telefon koyu moddayken siyah splash üretiyor). iOS build'leri telefonun koyu modunu izliyor,
  // açık zemindeki metin alanlarında yazı ve placeholder beyaz kalıyordu.
  it('has no dark splash screen, which would unpin the iOS interface style', () => {
    expect(getSplashPluginOptions()).not.toHaveProperty('dark');
  });
});
