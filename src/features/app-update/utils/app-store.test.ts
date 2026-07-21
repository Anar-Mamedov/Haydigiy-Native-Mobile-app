import * as Linking from 'expo-linking';
import { APP_STORE_URLS, getAppStoreUrl, openAppStore } from './app-store';

jest.mock('expo-linking', () => ({
  openURL: jest.fn(async () => undefined),
}));

const openURL = Linking.openURL as jest.MockedFunction<typeof Linking.openURL>;

describe('app-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the correct listing for each platform', () => {
    expect(getAppStoreUrl('android')).toBe(APP_STORE_URLS.android);
    expect(getAppStoreUrl('ios')).toBe(APP_STORE_URLS.ios);
    expect(getAppStoreUrl(null)).toBeNull();
  });

  it.each(['android', 'ios'] as const)('opens the %s store listing', async (platform) => {
    await openAppStore(platform);

    expect(openURL).toHaveBeenCalledWith(APP_STORE_URLS[platform]);
  });

  it('rejects unsupported platforms', async () => {
    await expect(openAppStore(null)).rejects.toThrow('mağazası bağlantısı bulunamadı');
    expect(openURL).not.toHaveBeenCalled();
  });
});
