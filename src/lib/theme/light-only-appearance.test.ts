import appJson from '../../../app.json';
import { config } from '../../../tamagui.config';

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
});
