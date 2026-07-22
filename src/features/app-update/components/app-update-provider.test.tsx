import { PropsWithChildren } from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AppState, Button, Text, View, type AppStateStatus } from 'react-native';
import { useLatestAppVersionQuery } from '../api/app-update.queries';
import { useAppUpdate } from '../context/app-update-context';
import { openAppStore } from '../utils/app-store';
import { getInstalledAppVersion } from '../utils/installed-app-version';
import { AppUpdateProvider, formatInstalledVersion } from './app-update-provider';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('../api/app-update.queries', () => ({
  useLatestAppVersionQuery: jest.fn(),
}));

jest.mock('../utils/app-store', () => ({
  getCurrentStorePlatform: jest.fn(() => 'ios'),
  openAppStore: jest.fn(async () => undefined),
}));

jest.mock('../utils/installed-app-version', () => ({
  getInstalledAppVersion: jest.fn(),
}));

const useLatestVersion = useLatestAppVersionQuery as jest.Mock;
const openStore = openAppStore as jest.MockedFunction<typeof openAppStore>;
const getInstalledVersion = getInstalledAppVersion as jest.MockedFunction<
  typeof getInstalledAppVersion
>;

function AppUpdateProbe() {
  const {
    dismissHomeBanner,
    errorMessage,
    installedVersionLabel,
    isHomeBannerVisible,
    isUpdateAvailable,
    openStore: openStoreFromContext,
  } = useAppUpdate();

  return (
    <View>
      <Text>{isUpdateAvailable ? 'Güncelleme var' : 'Güncel'}</Text>
      <Text>{isHomeBannerVisible ? 'Ana sayfa barı açık' : 'Ana sayfa barı kapalı'}</Text>
      <Text>{installedVersionLabel}</Text>
      <Text>{errorMessage}</Text>
      <Button onPress={dismissHomeBanner} title="Ana Sayfa Bildirimini Gizle" />
      <Button onPress={openStoreFromContext} title="Mağazayı Aç" />
    </View>
  );
}

function ProviderHarness({ children = <AppUpdateProbe /> }: PropsWithChildren) {
  return <AppUpdateProvider>{children}</AppUpdateProvider>;
}

describe('AppUpdateProvider', () => {
  const refetch = jest.fn(async () => ({ error: null }) as never);
  let appStateListeners: ((state: AppStateStatus) => void)[];

  beforeEach(() => {
    jest.clearAllMocks();
    appStateListeners = [];
    getInstalledVersion.mockReturnValue({
      applicationVersion: '2.3.10',
      buildVersion: '27',
    });
    useLatestVersion.mockReturnValue({
      data: '28',
      error: null,
      isFetchedAfterMount: true,
      isFetching: false,
      refetch,
    });
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
      appStateListeners.push(handler as (state: AppStateStatus) => void);
      return { remove: jest.fn() } as never;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('publishes a fresh update and the installed version label', () => {
    renderWithTamagui(<ProviderHarness />);

    expect(screen.getByText('Güncelleme var')).toBeTruthy();
    expect(screen.getByText('Ana sayfa barı açık')).toBeTruthy();
    expect(screen.getByText('2.3.10 (27)')).toBeTruthy();
  });

  it('does not publish cached version data while a fresh response is pending', () => {
    useLatestVersion.mockReturnValue({
      data: '28',
      error: null,
      isFetchedAfterMount: false,
      isFetching: true,
      refetch,
    });

    renderWithTamagui(<ProviderHarness />);

    expect(screen.getByText('Güncel')).toBeTruthy();
    expect(screen.getByText('Ana sayfa barı kapalı')).toBeTruthy();
  });

  it('dismisses only the home banner for the current remote version', () => {
    renderWithTamagui(<ProviderHarness />);

    fireEvent.press(screen.getByRole('button', { name: 'Ana Sayfa Bildirimini Gizle' }));

    expect(screen.getByText('Güncelleme var')).toBeTruthy();
    expect(screen.getByText('Ana sayfa barı kapalı')).toBeTruthy();
  });

  it('opens the current platform store', async () => {
    renderWithTamagui(<ProviderHarness />);

    fireEvent.press(screen.getByRole('button', { name: 'Mağazayı Aç' }));

    await waitFor(() => expect(openStore).toHaveBeenCalledTimes(1));
  });

  it('keeps the update available and exposes an error when the store cannot open', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    openStore.mockRejectedValueOnce(new Error('store unavailable'));
    renderWithTamagui(<ProviderHarness />);

    fireEvent.press(screen.getByRole('button', { name: 'Mağazayı Aç' }));

    expect(
      await screen.findByText('Uygulama mağazası açılamadı. Lütfen daha sonra tekrar deneyin.'),
    ).toBeTruthy();
    expect(screen.getByText('Güncelleme var')).toBeTruthy();
  });

  it('checks the live version again whenever the app returns to the foreground', async () => {
    renderWithTamagui(<ProviderHarness />);

    await act(async () => {
      appStateListeners.forEach((listener) => listener('active'));
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

describe('formatInstalledVersion', () => {
  it('formats the public and build versions together', () => {
    expect(
      formatInstalledVersion({ applicationVersion: '2.3.10', buildVersion: '27' }),
    ).toBe('2.3.10 (27)');
  });

  it('falls back safely when native version values are unavailable', () => {
    expect(formatInstalledVersion({ applicationVersion: null, buildVersion: null })).toBe(
      'Bilinmiyor',
    );
  });
});
