import { renderHook, waitFor } from '@testing-library/react-native';
import { useMetaClickIdCapture } from './use-meta-click-id-capture';
import { MetaClickIdStore } from '../services/meta-click-id-store';

const mockGetInitialURL = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemove = jest.fn();

jest.mock('expo-linking', () => ({
  getInitialURL: (...args: unknown[]) => mockGetInitialURL(...args),
  addEventListener: (...args: unknown[]) => mockAddEventListener(...args),
}));

const AD_LINK = 'https://haydigiy.com/urun-1?fbclid=IwAR0abcDEF123';
const allowed = async () => true;
const denied = async () => false;

function createStoreSpy(): MetaClickIdStore & { capture: jest.Mock } {
  return {
    capture: jest.fn(async () => undefined),
    getFbc: jest.fn(async () => null),
    clear: jest.fn(async () => undefined),
  };
}

describe('useMetaClickIdCapture', () => {
  let urlListener: ((event: { url: string }) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    urlListener = undefined;
    mockGetInitialURL.mockResolvedValue(null);
    mockAddEventListener.mockImplementation(
      (_eventType: string, listener: (event: { url: string }) => void) => {
        urlListener = listener;
        return { remove: mockRemove };
      },
    );
  });

  it('captures the link that cold-started the app', async () => {
    mockGetInitialURL.mockResolvedValue(AD_LINK);
    const store = createStoreSpy();

    renderHook(() => useMetaClickIdCapture(store, allowed));

    await waitFor(() => expect(store.capture).toHaveBeenCalledWith(AD_LINK));
  });

  it('captures links that arrive while the app is running', async () => {
    const store = createStoreSpy();
    renderHook(() => useMetaClickIdCapture(store, allowed));
    await waitFor(() => expect(mockGetInitialURL).toHaveBeenCalled());

    urlListener?.({ url: 'haydigiywebviewapp:///?to=%2Fsepet&al_applink_data=%7B%7D' });

    await waitFor(() =>
      expect(store.capture).toHaveBeenCalledWith(
        'haydigiywebviewapp:///?to=%2Fsepet&al_applink_data=%7B%7D',
      ),
    );
  });

  it('does not store the ad identifier without marketing consent', async () => {
    mockGetInitialURL.mockResolvedValue(AD_LINK);
    const isMarketingAllowed = jest.fn(denied);
    const store = createStoreSpy();

    renderHook(() => useMetaClickIdCapture(store, isMarketingAllowed));
    await waitFor(() => expect(isMarketingAllowed).toHaveBeenCalled());
    urlListener?.({ url: AD_LINK });
    await waitFor(() => expect(isMarketingAllowed).toHaveBeenCalledTimes(2));

    expect(store.capture).not.toHaveBeenCalled();
  });

  it('does nothing without an opening link and stops listening on unmount', async () => {
    const store = createStoreSpy();
    const { unmount } = renderHook(() => useMetaClickIdCapture(store, allowed));
    await waitFor(() => expect(mockGetInitialURL).toHaveBeenCalled());

    unmount();

    expect(store.capture).not.toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it('survives a storage failure without throwing', async () => {
    mockGetInitialURL.mockResolvedValue(AD_LINK);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const store = createStoreSpy();
    store.capture.mockRejectedValue(new Error('storage unavailable'));

    renderHook(() => useMetaClickIdCapture(store, allowed));

    await waitFor(() => expect(warn).toHaveBeenCalled());
    warn.mockRestore();
  });
});
