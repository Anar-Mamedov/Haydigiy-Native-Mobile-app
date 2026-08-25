import { act, renderHook, waitFor } from '@testing-library/react-native';
import { postNotifyStock } from '@/services/notify-stock.service';
import { useNotifyStock } from './use-notify-stock';

jest.mock('@/services/notify-stock.service', () => ({
  postNotifyStock: jest.fn(),
}));

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

/** Oturum durumu testten kontrol edilsin diye store selector'ı taklit ediliyor. */
let mockUser: { id: number } | null = { id: 1 };

jest.mock('@/features/auth/store/use-auth-store', () => ({
  useAuthStore: (selector: (state: { user: { id: number } | null }) => unknown) =>
    selector({ user: mockUser }),
}));

const NOTIFY_STOCK_ERROR_MESSAGE =
  'Bildirim talebiniz gönderilemedi. Lütfen daha sonra tekrar deneyin.';

const postNotifyStockMock = postNotifyStock as jest.MockedFunction<typeof postNotifyStock>;

describe('useNotifyStock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: 1 };
    postNotifyStockMock.mockResolvedValue(undefined);
  });

  it('sends the numeric variant id the backend expects', async () => {
    const { result } = renderHook(() => useNotifyStock());

    await act(async () => {
      await result.current.requestNotification('4821');
    });

    expect(postNotifyStockMock).toHaveBeenCalledWith(4821);
  });

  it('remembers the variant and opens the confirmation', async () => {
    const { result } = renderHook(() => useNotifyStock());

    await act(async () => {
      await result.current.requestNotification('4821');
    });

    await waitFor(() => {
      expect(result.current.isVariantNotified('4821')).toBe(true);
    });
    expect(result.current.isConfirmationOpen).toBe(true);
    expect(result.current.isVariantNotified('9999')).toBe(false);
  });

  it('ignores a missing or non-numeric variant id', async () => {
    const { result } = renderHook(() => useNotifyStock());

    await act(async () => {
      await result.current.requestNotification(undefined);
      await result.current.requestNotification('abc');
    });

    expect(postNotifyStockMock).not.toHaveBeenCalled();
  });

  it('leaves no error behind on a successful request', async () => {
    const { result } = renderHook(() => useNotifyStock());

    await act(async () => {
      await result.current.requestNotification('4821');
    });

    expect(result.current.errorMessage).toBeNull();
    expect(result.current.isConfirmationOpen).toBe(true);
  });

  // AGENTS.md: API istekleri sessizce başarısız olmamalı.
  it('surfaces the failure in the dialog instead of dropping it silently', async () => {
    postNotifyStockMock.mockRejectedValueOnce(new Error('network'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useNotifyStock());

    await act(async () => {
      await result.current.requestNotification('4821');
    });

    expect(result.current.isVariantNotified('4821')).toBe(false);
    expect(result.current.isNotifying).toBe(false);
    expect(result.current.isConfirmationOpen).toBe(true);
    expect(result.current.errorMessage).toBe(NOTIFY_STOCK_ERROR_MESSAGE);

    warn.mockRestore();
  });

  it('clears the error once the dialog is dismissed', async () => {
    postNotifyStockMock.mockRejectedValueOnce(new Error('network'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useNotifyStock());

    await act(async () => {
      await result.current.requestNotification('4821');
    });

    act(() => {
      result.current.closeConfirmation();
    });

    expect(result.current.isConfirmationOpen).toBe(false);
    expect(result.current.errorMessage).toBeNull();

    warn.mockRestore();
  });

  describe('signed-out visitor', () => {
    it('holds the request and sends the visitor to the login screen', async () => {
      mockUser = null;
      const { result } = renderHook(() => useNotifyStock());

      await act(async () => {
        await result.current.requestNotification('4821');
      });

      expect(postNotifyStockMock).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/profile');
      expect(result.current.isVariantNotified('4821')).toBe(false);
    });

    it('sends the held request as soon as the session opens', async () => {
      mockUser = null;
      const { rerender, result } = renderHook(() => useNotifyStock());

      await act(async () => {
        await result.current.requestNotification('4821');
      });
      expect(postNotifyStockMock).not.toHaveBeenCalled();

      mockUser = { id: 1 };
      await act(async () => {
        rerender(undefined);
      });

      await waitFor(() => {
        expect(postNotifyStockMock).toHaveBeenCalledWith(4821);
      });
      await waitFor(() => {
        expect(result.current.isVariantNotified('4821')).toBe(true);
      });
      expect(result.current.isConfirmationOpen).toBe(true);
    });

    it('sends the held request only once', async () => {
      mockUser = null;
      const { rerender, result } = renderHook(() => useNotifyStock());

      await act(async () => {
        await result.current.requestNotification('4821');
      });

      mockUser = { id: 1 };
      await act(async () => {
        rerender(undefined);
      });
      await waitFor(() => {
        expect(postNotifyStockMock).toHaveBeenCalledTimes(1);
      });

      await act(async () => {
        rerender(undefined);
      });

      expect(postNotifyStockMock).toHaveBeenCalledTimes(1);
    });

    it('surfaces a failure of the auto-sent request too', async () => {
      postNotifyStockMock.mockRejectedValueOnce(new Error('network'));
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockUser = null;
      const { rerender, result } = renderHook(() => useNotifyStock());

      await act(async () => {
        await result.current.requestNotification('4821');
      });

      mockUser = { id: 1 };
      await act(async () => {
        rerender(undefined);
      });

      await waitFor(() => {
        expect(result.current.errorMessage).toBe(NOTIFY_STOCK_ERROR_MESSAGE);
      });
      expect(result.current.isConfirmationOpen).toBe(true);
      expect(result.current.isVariantNotified('4821')).toBe(false);

      warn.mockRestore();
    });

    it('does not navigate when there is no usable variant id', async () => {
      mockUser = null;
      const { result } = renderHook(() => useNotifyStock());

      await act(async () => {
        await result.current.requestNotification(undefined);
        await result.current.requestNotification('abc');
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(postNotifyStockMock).not.toHaveBeenCalled();
    });
  });
});
