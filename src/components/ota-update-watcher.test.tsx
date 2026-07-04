import { act, render, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';
import { OTA_CHECK_INTERVAL_MS, OtaUpdateWatcher } from './ota-update-watcher';

jest.mock('expo-updates', () => ({
  isEnabled: true,
  checkForUpdateAsync: jest.fn(async () => ({ isAvailable: false })),
  fetchUpdateAsync: jest.fn(async () => undefined),
}));

const checkForUpdateAsync = Updates.checkForUpdateAsync as jest.MockedFunction<
  typeof Updates.checkForUpdateAsync
>;
const fetchUpdateAsync = Updates.fetchUpdateAsync as jest.MockedFunction<
  typeof Updates.fetchUpdateAsync
>;

const devGlobal = globalThis as unknown as { __DEV__: boolean };

describe('OtaUpdateWatcher', () => {
  let appStateListeners: ((state: AppStateStatus) => void)[];

  beforeEach(() => {
    jest.clearAllMocks();
    appStateListeners = [];
    // Watcher yalnızca release build'lerde çalışır; testler release'i simüle eder.
    devGlobal.__DEV__ = false;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
      appStateListeners.push(handler as (state: AppStateStatus) => void);
      return { remove: jest.fn() } as never;
    });
  });

  afterEach(() => {
    devGlobal.__DEV__ = true;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('stays fully silent in development (Expo Go / dev client)', async () => {
    devGlobal.__DEV__ = true;
    checkForUpdateAsync.mockResolvedValue({ isAvailable: true } as never);

    render(<OtaUpdateWatcher />);

    await act(async () => {
      appStateListeners.forEach((listener) => listener('active'));
    });
    expect(checkForUpdateAsync).not.toHaveBeenCalled();
    expect(fetchUpdateAsync).not.toHaveBeenCalled();
  });

  it('downloads the update silently on cold start when one is available', async () => {
    checkForUpdateAsync.mockResolvedValue({ isAvailable: true } as never);

    render(<OtaUpdateWatcher />);

    await waitFor(() => expect(fetchUpdateAsync).toHaveBeenCalledTimes(1));
  });

  it('does not download anything when no update is available', async () => {
    checkForUpdateAsync.mockResolvedValue({ isAvailable: false } as never);

    render(<OtaUpdateWatcher />);

    await waitFor(() => expect(checkForUpdateAsync).toHaveBeenCalledTimes(1));
    expect(fetchUpdateAsync).not.toHaveBeenCalled();
  });

  it('checks and downloads again when the app returns to the foreground', async () => {
    checkForUpdateAsync
      .mockResolvedValueOnce({ isAvailable: false } as never)
      .mockResolvedValue({ isAvailable: true } as never);

    render(<OtaUpdateWatcher />);
    await waitFor(() => expect(checkForUpdateAsync).toHaveBeenCalledTimes(1));

    await act(async () => {
      appStateListeners.forEach((listener) => listener('active'));
    });

    await waitFor(() => expect(fetchUpdateAsync).toHaveBeenCalledTimes(1));
    expect(checkForUpdateAsync).toHaveBeenCalledTimes(2);
  });

  it('checks periodically while the app stays in the foreground', async () => {
    jest.useFakeTimers();
    checkForUpdateAsync.mockResolvedValue({ isAvailable: false } as never);
    const appState = AppState as unknown as { currentState: AppStateStatus };
    const originalState = appState.currentState;
    appState.currentState = 'active';

    try {
      render(<OtaUpdateWatcher />);
      await act(async () => {
        await jest.advanceTimersByTimeAsync(0);
      });
      expect(checkForUpdateAsync).toHaveBeenCalledTimes(1);

      await act(async () => {
        await jest.advanceTimersByTimeAsync(OTA_CHECK_INTERVAL_MS);
      });
      expect(checkForUpdateAsync).toHaveBeenCalledTimes(2);
    } finally {
      appState.currentState = originalState;
    }
  });
});
