import { act, render } from '@testing-library/react-native';
import { IncomingLinkHandler } from './incoming-link-handler';

const mockDismissTo = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemove = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ dismissTo: mockDismissTo }),
}));

jest.mock('expo-linking', () => ({
  addEventListener: (...args: unknown[]) => mockAddEventListener(...args),
}));

describe('IncomingLinkHandler', () => {
  let urlListener: ((event: { url: string }) => void) | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    urlListener = undefined;
    mockAddEventListener.mockImplementation(
      (_eventType: string, listener: (event: { url: string }) => void) => {
        urlListener = listener;
        return { remove: mockRemove };
      },
    );
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('dismisses a stale product screen and opens a category from a warm link', () => {
    render(<IncomingLinkHandler />);

    act(() => {
      urlListener?.({ url: 'https://haydigiy.com/haydigiy-butik?c=147' });
      jest.runOnlyPendingTimers();
    });

    expect(mockDismissTo).toHaveBeenCalledWith('/kategori/haydigiy-butik?c=147');
  });

  it('makes the newest link authoritative when links arrive successively', () => {
    render(<IncomingLinkHandler />);

    act(() => {
      urlListener?.({ url: 'https://haydigiy.com/siyah-elbise-123' });
      urlListener?.({ url: 'https://haydigiy.com/haydigiy-butik?c=147' });
      jest.runOnlyPendingTimers();
    });

    expect(mockDismissTo).toHaveBeenCalledTimes(1);
    expect(mockDismissTo).toHaveBeenCalledWith('/kategori/haydigiy-butik?c=147');
  });

  it('removes its listener and cancels pending navigation when unmounted', () => {
    const { unmount } = render(<IncomingLinkHandler />);

    act(() => {
      urlListener?.({ url: 'https://haydigiy.com/haydigiy-butik?c=147' });
    });

    unmount();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockDismissTo).not.toHaveBeenCalled();
  });
});
