import SdkInsiderCallbackType from 'react-native-insider/src/InsiderCallbackType';
import { InsiderCallbackType } from './insider.types';

/**
 * Callback tipleri SDK'dan kopyalandığı için kaymaya açık. SDK sürümü
 * yükseltildiğinde bu test kırılır ve sessiz bir yanlış eşleşme yerine
 * derhal görünür hale gelir.
 */
describe('InsiderCallbackType', () => {
  it('SDK ile birebir aynı değerleri taşır', () => {
    expect(InsiderCallbackType).toEqual(SdkInsiderCallbackType);
  });

  it('InApp callbackleri push açılışından farklı tiplerdir', () => {
    expect(InsiderCallbackType.INAPP_BUTTON_CLICK).not.toBe(InsiderCallbackType.NOTIFICATION_OPEN);
    expect(InsiderCallbackType.INAPP_SEEN).not.toBe(InsiderCallbackType.NOTIFICATION_OPEN);
  });
});
