import { act, render } from '@testing-library/react-native';
import { InsiderIntegration } from './insider-integration';
import { insiderClient } from '../services/insider-client';
import { InsiderCallback, InsiderCallbackType } from '../types/insider.types';

const mockDismissTo = jest.fn();
const mockRouter = { dismissTo: mockDismissTo };
const mockOpenURL = jest.fn();
const mockGetInitialURL = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemove = jest.fn();
let mockNavigationKey: string | undefined;

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useRootNavigationState: () => mockNavigationKey ? { key: mockNavigationKey } : undefined,
}));

jest.mock('expo-linking', () => ({
  openURL: (...args: unknown[]) => mockOpenURL(...args),
  getInitialURL: () => mockGetInitialURL(),
  addEventListener: (...args: unknown[]) => mockAddEventListener(...args),
}));

jest.mock('../services/insider-client', () => ({
  insiderClient: { initialize: jest.fn(), clearCallback: jest.fn(), handleIncomingUrl: jest.fn() },
}));

jest.mock('../services/insider-tracker', () => ({
  insiderTracker: { restoreRecommendationAttribution: jest.fn() },
}));

jest.mock('../utils/insider-diagnostics', () => ({ logInsiderCallback: jest.fn() }));

describe('InsiderIntegration', () => {
  let callback: InsiderCallback;

  beforeEach(() => {
    jest.resetAllMocks();
    mockNavigationKey = 'root';
    mockOpenURL.mockResolvedValue(undefined);
    mockGetInitialURL.mockResolvedValue(null);
    mockAddEventListener.mockReturnValue({ remove: mockRemove });
    jest.mocked(insiderClient.initialize).mockImplementation((nextCallback) => {
      callback = nextCallback;
      return true;
    });
  });

  it('retains a launch notification until the root navigator is ready, then consumes it once', () => {
    mockNavigationKey = undefined;
    jest.mocked(insiderClient.initialize).mockImplementation((nextCallback) => {
      callback = nextCallback;
      callback(InsiderCallbackType.NOTIFICATION_OPEN, {
        data: { ins_dl_json: '{"screen":"product","product_id":"12345"}' },
      });
      return true;
    });
    const { rerender } = render(<InsiderIntegration />);
    expect(mockDismissTo).not.toHaveBeenCalled();

    mockNavigationKey = 'root';
    rerender(<InsiderIntegration />);
    rerender(<InsiderIntegration />);
    expect(mockDismissTo).toHaveBeenCalledTimes(1);
    expect(mockDismissTo).toHaveBeenCalledWith('/product/12345');
    expect(insiderClient.initialize).toHaveBeenCalledTimes(1);
  });

  it('navigates successive warm notification taps including the same target again', () => {
    render(<InsiderIntegration />);
    for (const screen of ['cart', 'favorites', 'favorites']) {
      act(() => callback(InsiderCallbackType.NOTIFICATION_OPEN, { data: { screen } }));
    }
    expect(mockDismissTo.mock.calls).toEqual([['/cart'], ['/favorites'], ['/favorites']]);
  });

  it('keeps the latest tapped target while waiting and ignores non-navigation callbacks', () => {
    mockNavigationKey = undefined;
    const { rerender } = render(<InsiderIntegration />);
    act(() => {
      callback(InsiderCallbackType.NOTIFICATION_OPEN, { screen: 'cart' });
      callback(InsiderCallbackType.NOTIFICATION_OPEN, { screen: 'favorites' });
      callback(InsiderCallbackType.SESSION_STARTED, { screen: 'home' });
      callback(InsiderCallbackType.NOTIFICATION_OPEN, { ins_dl_json: 'invalid' });
    });
    mockNavigationKey = 'root';
    rerender(<InsiderIntegration />);
    expect(mockDismissTo.mock.calls).toEqual([['/favorites']]);
  });

  it('opens external URLs through the OS and preserves InApp click behavior', () => {
    render(<InsiderIntegration />);
    act(() => callback(InsiderCallbackType.NOTIFICATION_OPEN, {
      data: { ins_dl_json: '{"ins_dl_external":"https://example.com/help"}' },
    }));
    expect(mockOpenURL).toHaveBeenCalledWith('https://example.com/help');
    expect(mockDismissTo).not.toHaveBeenCalled();

    act(() => callback(InsiderCallbackType.INAPP_BUTTON_CLICK, { ins_dl_internal: '/sepet' }));
    expect(mockDismissTo).toHaveBeenCalledWith('/cart');
  });

  it('catches OS failures to open an external URL', async () => {
    const error = new Error('Cannot open URL');
    mockOpenURL.mockRejectedValue(error);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<InsiderIntegration />);
    await act(async () => callback(InsiderCallbackType.NOTIFICATION_OPEN, {
      ins_dl_external: 'https://example.com/help',
    }));
    expect(warn).toHaveBeenCalledWith('[Insider] Harici bağlantı açılamadı.', error);
    warn.mockRestore();
  });

  it('still forwards initial and live URLs to the SDK and removes callbacks on unmount', async () => {
    mockGetInitialURL.mockResolvedValue('insiderhaydigiyprod://test_device/123');
    const { unmount } = render(<InsiderIntegration />);
    await act(async () => {});
    expect(insiderClient.handleIncomingUrl).toHaveBeenCalledWith('insiderhaydigiyprod://test_device/123');

    const listener = mockAddEventListener.mock.calls[0][1];
    act(() => listener({ url: 'https://haydigiy.com/sepet' }));
    expect(insiderClient.handleIncomingUrl).toHaveBeenCalledWith('https://haydigiy.com/sepet');

    unmount();
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(insiderClient.clearCallback).toHaveBeenCalledWith(callback);
  });
});
