import {
  isHaydigiyUniversalLink,
  isInsiderSdkUrl,
  isTrustedAppUrl,
  resolveInsiderCallbackAction,
  resolveInsiderPushAction,
} from './insider-url';
import { InsiderCallbackType } from '../types/insider.types';

describe('Insider URL helpers', () => {
  it('recognizes the partner-specific Insider test-device URL', () => {
    expect(isInsiderSdkUrl('insiderhaydigiyprod://test_device/123')).toBe(true);
    expect(isInsiderSdkUrl('haydigiywebviewapp://product/test')).toBe(false);
  });

  it('only accepts the Haydigiy storefront as a universal link', () => {
    expect(isHaydigiyUniversalLink('https://haydigiy.com/siyah-elbise')).toBe(true);
    expect(isHaydigiyUniversalLink('https://www.haydigiy.com/sepet')).toBe(true);
    expect(isHaydigiyUniversalLink('https://haydigiy.com.evil.example/sepet')).toBe(false);
  });

  it('accepts app paths and the registered app scheme', () => {
    expect(isTrustedAppUrl('/sepet')).toBe(true);
    expect(isTrustedAppUrl('haydigiywebviewapp://sepet')).toBe(true);
    expect(isTrustedAppUrl('//evil.example/phishing')).toBe(false);
    expect(isTrustedAppUrl('javascript:alert(1)')).toBe(false);
  });

  it('resolves a nested Insider internal deep link', () => {
    expect(
      resolveInsiderPushAction({
        type: 0,
        data: { ins_dl_internal: 'https://www.haydigiy.com/siyah-elbise' },
      }),
    ).toEqual({
      type: 'internal',
      url: 'https://www.haydigiy.com/siyah-elbise',
    });
  });

  it('resolves a valid external deep link without treating it as an app route', () => {
    expect(
      resolveInsiderPushAction({ ins_dl_external: 'https://support.example.com/ticket' }),
    ).toEqual({
      type: 'external',
      url: 'https://support.example.com/ticket',
    });
  });

  it('rejects an untrusted URL placed in the internal deep-link field', () => {
    expect(
      resolveInsiderPushAction({ ins_dl_internal: 'https://evil.example/phishing' }),
    ).toBeNull();
  });

  it('rejects an insecure external URL', () => {
    expect(resolveInsiderPushAction({ ins_dl_external: 'http://example.com' })).toBeNull();
  });
});

describe('resolveInsiderCallbackAction', () => {
  const deepLinkPayload = { ins_dl_internal: '/product/test-urun-123456-1' };

  it('push açılışında yönlendirmeyi çözer', () => {
    expect(resolveInsiderCallbackAction(InsiderCallbackType.NOTIFICATION_OPEN, deepLinkPayload)).toEqual({
      type: 'internal',
      url: '/product/test-urun-123456-1',
    });
  });

  it('InApp buton tıklamasında da aynı yönlendirmeyi çözer', () => {
    // Regresyon: yalnızca NOTIFICATION_OPEN dinlendiğinde InApp butonu hiçbir şey yapmıyordu.
    expect(resolveInsiderCallbackAction(InsiderCallbackType.INAPP_BUTTON_CLICK, deepLinkPayload)).toEqual({
      type: 'internal',
      url: '/product/test-urun-123456-1',
    });
  });

  it('harici InApp bağlantısını external olarak çözer', () => {
    expect(
      resolveInsiderCallbackAction(InsiderCallbackType.INAPP_BUTTON_CLICK, {
        ins_dl_external: 'https://ornek.com/kampanya',
      }),
    ).toEqual({ type: 'external', url: 'https://ornek.com/kampanya' });
  });

  it('yönlendirme taşımayan callback tipleri için null döner', () => {
    for (const type of [
      InsiderCallbackType.INAPP_SEEN,
      InsiderCallbackType.SESSION_STARTED,
      InsiderCallbackType.TEMP_STORE_PURCHASE,
      InsiderCallbackType.TEMP_STORE_ADDED_TO_CART,
      InsiderCallbackType.TEMP_STORE_CUSTOM_ACTION,
    ]) {
      expect(resolveInsiderCallbackAction(type, deepLinkPayload)).toBeNull();
    }
  });

  it('güvenilmeyen hedefi InApp tıklamasında da reddeder', () => {
    expect(
      resolveInsiderCallbackAction(InsiderCallbackType.INAPP_BUTTON_CLICK, {
        ins_dl_internal: 'https://kotu-site.com/phishing',
      }),
    ).toBeNull();
  });
});
