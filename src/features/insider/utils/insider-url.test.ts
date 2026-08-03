import {
  isHaydigiyUniversalLink,
  isInsiderSdkUrl,
  isTrustedAppUrl,
  resolveInsiderPushAction,
} from './insider-url';

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
