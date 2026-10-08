import { resolveAccountDeepLinkPath } from './resolve-account-deep-link';

const segmentsOf = (path: string) => path.split('/').filter(Boolean);

describe('resolveAccountDeepLinkPath', () => {
  it.each([
    ['/hesabim/duyurular', '/announcement-preferences'],
    ['/m/hesabim/duyurular', '/announcement-preferences'],
    ['/hesabim/geri-bildirim', '/feedback'],
    ['/m/hesabim/geri-bildirim', '/feedback'],
    ['/M/Hesabim/Duyurular', '/announcement-preferences'],
    ['/hesabim/kullaniciBilgileri', '/user-info'],
    ['/hesabim/yardim', '/help'],
    ['/hesabim/bildirimlerim', '/orders'],
  ])('maps %s to %s', (webPath, appPath) => {
    expect(resolveAccountDeepLinkPath(segmentsOf(webPath), '')).toBe(appPath);
  });

  it('keeps the query string on static account pages', () => {
    expect(resolveAccountDeepLinkPath(['hesabim', 'duyurular'], '?utm_source=sms')).toBe(
      '/announcement-preferences?utm_source=sms',
    );
    expect(resolveAccountDeepLinkPath(['m', 'hesabim', 'geri-bildirim'], '?ref=mail')).toBe('/feedback?ref=mail');
  });

  it('opens the profile for the account root and unknown account pages', () => {
    expect(resolveAccountDeepLinkPath(['hesabim'], '')).toBe('/profile');
    expect(resolveAccountDeepLinkPath(['m', 'hesabim'], '?x=1')).toBe('/profile?x=1');
    expect(resolveAccountDeepLinkPath(['hesabim', 'mesajlarim'], '')).toBe('/profile');
    expect(resolveAccountDeepLinkPath(['hesabim', 'duyurular', 'detay'], '')).toBe('/profile');
  });

  it('maps address and order detail paths', () => {
    expect(resolveAccountDeepLinkPath(['hesabim', 'adreslerim', 'ekle'], '')).toBe('/address-form');
    expect(resolveAccountDeepLinkPath(['hesabim', 'adreslerim', '12'], '?from=checkout')).toBe(
      '/address-form?id=12&from=checkout',
    );
    expect(resolveAccountDeepLinkPath(['hesabim', 'siparislerim', '55'], '')).toBe('/order/55');
  });

  it('returns null for non-account paths', () => {
    expect(resolveAccountDeepLinkPath(['blog'], '')).toBeNull();
    expect(resolveAccountDeepLinkPath(['m', 'sepet'], '')).toBeNull();
    expect(resolveAccountDeepLinkPath([], '')).toBeNull();
  });
});
