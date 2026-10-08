import { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCancelReturnRequest } from './use-cancel-return-request';
import { OrderDetail } from '@/types/order.types';

const mockCancelReturnRequestDto = jest.fn();
const mockCancelHepsijetDelivery = jest.fn();

jest.mock('@/services/return.service', () => ({
  cancelReturnRequestDto: (id: number) => mockCancelReturnRequestDto(id),
  getReturnErrorMessage: (_error: unknown, fallback: string) => fallback,
}));

jest.mock('@/services/hepsijet.service', () => ({
  cancelHepsijetDelivery: (deliveryNo: string) => mockCancelHepsijetDelivery(deliveryNo),
  getHepsijetReturnDeliveryNo: (orderNo: string) => `IADE-${orderNo}`,
}));

function wrapper({ children }: PropsWithChildren) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const ORDER = { id: 1, orderNo: 'HG1', hasHepsijetReturn: false } as OrderDetail;

describe('useCancelReturnRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Talep bazlı iade kartları: yalnızca iptali süren kart "İptal ediliyor..." gösterir.
  it('exposes the request being cancelled and clears it once settled', async () => {
    let resolveCancel: (value: { message?: string }) => void = () => undefined;
    mockCancelReturnRequestDto.mockReturnValue(
      new Promise((resolve) => {
        resolveCancel = resolve;
      }),
    );
    const { result } = renderHook(() => useCancelReturnRequest(ORDER), { wrapper });

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.cancelReturn(43);
    });

    expect(result.current.cancelingId).toBe(43);
    expect(result.current.isCanceling).toBe(true);
    expect(mockCancelReturnRequestDto).toHaveBeenCalledWith(43);

    await act(async () => {
      resolveCancel({ message: 'İptal edildi.' });
      await pending;
    });

    expect(result.current.cancelingId).toBeNull();
    expect(result.current.isCanceling).toBe(false);
    expect(result.current.successMessage).toBe('İptal edildi.');
  });

  it('cancels the Hepsijet pickup first and stops when that fails', async () => {
    mockCancelHepsijetDelivery.mockResolvedValue({ success: false, message: 'Gönderi iptal edilemedi.' });
    const { result } = renderHook(
      () => useCancelReturnRequest({ ...ORDER, hasHepsijetReturn: true }),
      { wrapper },
    );

    await act(async () => {
      await result.current.cancelReturn(43);
    });

    expect(mockCancelHepsijetDelivery).toHaveBeenCalledWith('IADE-HG1');
    expect(mockCancelReturnRequestDto).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe('Gönderi iptal edilemedi.');
    expect(result.current.cancelingId).toBeNull();
  });
});
