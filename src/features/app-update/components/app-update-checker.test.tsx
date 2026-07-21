import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { AppUpdateChecker } from './app-update-checker';
import { useLatestAppVersionQuery } from '../api/app-update.queries';
import { openAppStore } from '../utils/app-store';
import { getInstalledAppVersion } from '../utils/installed-app-version';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('../api/app-update.queries', () => ({
  useLatestAppVersionQuery: jest.fn(),
}));

jest.mock('./app-update-dialog', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Button, Text, View } = jest.requireActual<typeof import('react-native')>(
    'react-native',
  );

  return {
    AppUpdateDialog: ({
      open,
      errorMessage,
      onConfirm,
      onDismiss,
    }: {
      open: boolean;
      errorMessage: string | null;
      onConfirm: () => void;
      onDismiss: () => void;
    }) =>
      open
        ? React.createElement(
            View,
            null,
            React.createElement(Text, null, errorMessage),
            React.createElement(Button, { onPress: onConfirm, title: 'Evet' }),
            React.createElement(Button, { onPress: onDismiss, title: 'Hayır' }),
          )
        : null,
  };
});

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

describe('AppUpdateChecker', () => {
  const refetch = jest.fn(async () => undefined);
  let appStateListeners: ((state: AppStateStatus) => void)[];

  beforeEach(() => {
    jest.clearAllMocks();
    appStateListeners = [];
    getInstalledVersion.mockReturnValue({
      applicationVersion: '2.3.9',
      buildVersion: '26',
    });
    useLatestVersion.mockReturnValue({
      data: '27',
      error: null,
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

  it('shows the dialog only when the API version is newer', () => {
    const updateRender = renderWithTamagui(<AppUpdateChecker />);

    expect(screen.getByRole('button', { name: 'Evet' })).toBeTruthy();
    updateRender.unmount();

    useLatestVersion.mockReturnValue({ data: '26', error: null, refetch });
    renderWithTamagui(<AppUpdateChecker />);

    expect(screen.queryByRole('button', { name: 'Evet' })).toBeNull();
  });

  it('opens the platform store when Evet is pressed', async () => {
    renderWithTamagui(<AppUpdateChecker />);

    fireEvent.press(screen.getByRole('button', { name: 'Evet' }));

    await waitFor(() => expect(openStore).toHaveBeenCalledTimes(1));
  });

  it('dismisses the current version when Hayır is pressed', () => {
    renderWithTamagui(<AppUpdateChecker />);

    fireEvent.press(screen.getByRole('button', { name: 'Hayır' }));

    expect(screen.queryByRole('button', { name: 'Evet' })).toBeNull();
  });

  it('checks again whenever the app returns to the foreground', async () => {
    renderWithTamagui(<AppUpdateChecker />);

    await act(async () => {
      appStateListeners.forEach((listener) => listener('active'));
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
