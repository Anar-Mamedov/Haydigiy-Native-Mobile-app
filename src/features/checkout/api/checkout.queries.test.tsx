import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useInstallmentPlansQuery } from './checkout.queries';
import * as installmentService from '@/services/installment.service';

jest.mock('@/services/payment-type.service', () => ({ getPaymentTypesDto: jest.fn() }));
jest.mock('@/services/cargo.service', () => ({ getCargoCompaniesDto: jest.fn() }));
jest.mock('@/services/address.service', () => ({ getAddressesDto: jest.fn() }));
jest.mock('@/services/installment.service', () => ({
  getInstallmentsDto: jest.fn(),
}));

const getInstallmentsDto = installmentService.getInstallmentsDto as jest.MockedFunction<
  typeof installmentService.getInstallmentsDto
>;

function makePlansResponse(perMonth: number, total: number) {
  return {
    status: 'success',
    installmentDetails: [
      {
        installmentPrices: [
          { installmentNumber: 2, installmentPrice: perMonth, totalPrice: total },
        ],
      },
    ],
  };
}

function renderInstallmentPlans(initialProps: { bin: string; amount: number }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

  return renderHook(
    ({ bin, amount }: { bin: string; amount: number }) => useInstallmentPlansQuery(bin, amount),
    {
      initialProps,
      wrapper: ({ children }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    },
  );
}

describe('useInstallmentPlansQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getInstallmentsDto.mockResolvedValue(makePlansResponse(1219.92, 2439.84));
  });

  // Regression: cache anahtarı tutarı liraya yuvarlıyordu; 1 TL altı toplam
  // değişimlerinde eski tutarın taksit planları ekranda kalıyor ve
  // `taksit × aylık tutar` backend'in hesapladığı sipariş toplamının altına
  // düşebiliyordu ("Taksitli tutar ürün bedelinden düşük olamaz").
  it('refetches plans when the single-payment total changes by less than a lira (web parity)', async () => {
    const { rerender } = renderInstallmentPlans({ bin: '55411234', amount: 2439.84 });

    await waitFor(() => expect(getInstallmentsDto).toHaveBeenCalledTimes(1));
    expect(getInstallmentsDto).toHaveBeenLastCalledWith('55411234', 2439.84);

    getInstallmentsDto.mockResolvedValue(makePlansResponse(1220.1, 2440.2));
    rerender({ bin: '55411234', amount: 2440.2 });

    await waitFor(() => expect(getInstallmentsDto).toHaveBeenCalledTimes(2));
    expect(getInstallmentsDto).toHaveBeenLastCalledWith('55411234', 2440.2);
  });

  it('serves the cached plans while the BIN and amount stay the same', async () => {
    const { rerender, result } = renderInstallmentPlans({ bin: '55411234', amount: 2439.84 });

    await waitFor(() => expect(result.current.data).toHaveLength(1));

    rerender({ bin: '55411234', amount: 2439.84 });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(getInstallmentsDto).toHaveBeenCalledTimes(1);
  });
});
