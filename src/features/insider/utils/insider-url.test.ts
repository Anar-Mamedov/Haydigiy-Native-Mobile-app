import {
  isHaydigiyUniversalLink,
  isInsiderSdkUrl,
  isTrustedAppUrl,
  resolveInsiderCallbackAction,
  resolveInsiderPushAction,
} from './insider-url';
import { InsiderCallbackType } from '../types/insider.types';
import { resolveDeepLinkPath } from '@/utils/resolve-deep-link';

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

describe('Targeted App Push deep links', () => {
  it.each([
    [{ screen: 'product', product_id: '12345' }, '/product/12345'],
    [{ screen: 'product_detail', product_id: 67890 }, '/product/67890'],
    [{ screen: 'product', product_slug: 'siyah-elbise', product_id: '12345' }, '/product/siyah-elbise'],
    [{ screen: 'category', category_id: '147', category_slug: 'elbise' }, '/kategori/elbise?c=147'],
    [{ screen: 'category', category_id: 147 }, '/kategori/all?c=147'],
    [{ screen: 'order', order_id: '940225' }, '/order/940225'],
    [{ screen: 'home' }, '/'],
    [{ screen: 'cart' }, '/cart'],
    [{ screen: 'favorites' }, '/favorites'],
    [{ screen: 'orders' }, '/orders'],
    [{ screen: 'profile' }, '/profile'],
  ])('opens custom screen payload %j through the real app link resolver', (data, route) => {
    for (const payload of [data, { data }, { data: { ins_dl_json: JSON.stringify(data) } }]) {
      const action = resolveInsiderPushAction(payload);
      expect(action?.type).toBe('internal');
      expect(resolveDeepLinkPath(action!.url)).toBe(route);
    }
  });

  it.each([
    ['ins_dl_internal', 'https://haydigiy.com/sepet', 'internal'],
    ['ins_dl_url_scheme', 'haydigiywebviewapp://favorites', 'internal'],
    ['ins_dl_external', 'https://support.example.com/help', 'external'],
  ])('resolves %s inside both string and object JSON', (key, url, type) => {
    const target = { [key]: url };
    expect(resolveInsiderPushAction({ ins_dl_json: JSON.stringify(target) })).toEqual({ type, url });
    expect(resolveInsiderPushAction({ ins_dl_json: target })).toEqual({ type, url });
  });

  it.each([
    { screen: 'unknown', product_id: '123' },
    { screen: 'product' },
    { screen: 'product', product_id: -1 },
    { screen: 'product', product_id: 1.5 },
    { screen: 'product', product_id: Number.MAX_SAFE_INTEGER + 1 },
    { screen: 'product', product_id: '123/../../orders' },
    { screen: 'product', product_slug: '../orders' },
    { screen: 'category', category_id: '1&c=2' },
    { screen: 'order', order_id: 0 },
    { ins_dl_json: '{invalid' },
    { ins_dl_json: 'null' },
    { ins_dl_json: '[]' },
    { ins_dl_json: '"/sepet"' },
    { ins_dl_json: '{"ins_dl_internal":"https://haydigiy.com.evil.example/sepet"}' },
    { ins_dl_json: '{"ins_dl_external":"javascript:alert(1)"}' },
    { ins_dl_json: '{"ins_dl_url_scheme":"other-app://sepet"}' },
  ])('ignores malformed or unsupported payload %j', (payload) => {
    expect(resolveInsiderPushAction(payload)).toBeNull();
  });

  it('bounds recursive JSON objects', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.ins_dl_json = cyclic;
    expect(resolveInsiderPushAction(cyclic)).toBeNull();
  });

  it('keeps explicit URLs authoritative over a legacy screen fallback', () => {
    expect(resolveInsiderPushAction({
      ins_dl_internal: 'https://haydigiy.com/sepet',
      screen: 'product_detail',
      product_id: '12345',
    })).toEqual({ type: 'internal', url: 'https://haydigiy.com/sepet' });
  });

  it.each(['carousel', 'slider'])('uses the clicked %s item supplied by the SDK', (type) => {
    const advanced_push_payload = {
      advanced_push_type: type,
      advanced_push_items: [
        { id: 1, deep_links: { screen: 'product', product_id: '111' } },
        { id: 2, deep_links: { screen: 'product', product_id: '222' } },
      ],
    };
    expect(resolveInsiderPushAction({
      data: { screen: 'product', product_id: '222', advanced_push_payload },
    })).toEqual({ type: 'internal', url: '/product/222' });
    expect(resolveInsiderPushAction({ data: { advanced_push_payload } })).toBeNull();
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
