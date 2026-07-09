import appConfig from '../app.json';

describe('app.json deep-link configuration', () => {
  const { expo } = appConfig;

  it('registers the custom URL scheme used by web-to-app links', () => {
    expect(expo.scheme).toBe('haydigiywebviewapp');
  });

  it('declares iOS Universal Links for the storefront domain', () => {
    expect(expo.ios.associatedDomains).toEqual(
      expect.arrayContaining(['applinks:haydigiy.com', 'applinks:www.haydigiy.com']),
    );
  });

  it('declares an auto-verified Android App Link intent filter for https haydigiy.com', () => {
    const httpsFilter = expo.android.intentFilters.find(
      (filter) =>
        filter.action === 'VIEW' &&
        filter.autoVerify === true &&
        filter.data.some((entry) => entry.scheme === 'https' && entry.host === 'haydigiy.com'),
    );

    expect(httpsFilter).toBeDefined();
    expect(httpsFilter?.category).toEqual(expect.arrayContaining(['BROWSABLE', 'DEFAULT']));
  });
});
