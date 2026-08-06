import { act, renderHook, waitFor } from '@testing-library/react-native';
import { postNotifyStock } from '@/services/notify-stock.service';
import { useNotifyStock } from './use-notify-stock';

jest.mock('@/services/notify-stock.service', () => ({
  postNotifyStock: jest.fn(),
}));

const postNotifyStockMock = postNotifyStock as jest.MockedFunction<typeof postNotifyStock>;

describe('useNotifyStock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('does not mark the variant as notified when the request fails', async () => {
    postNotifyStockMock.mockRejectedValueOnce(new Error('network'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useNotifyStock());

    await act(async () => {
      await expect(result.current.requestNotification('4821')).rejects.toThrow('network');
    });

    expect(result.current.isVariantNotified('4821')).toBe(false);
    expect(result.current.isConfirmationOpen).toBe(false);
    expect(result.current.isNotifying).toBe(false);

    warn.mockRestore();
  });
});
