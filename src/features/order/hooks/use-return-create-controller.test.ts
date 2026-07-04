import { act, renderHook } from '@testing-library/react-native';
import { useReturnCreateController } from './use-return-create-controller';
import * as returnQueries from '../api/return.queries';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, replace: jest.fn() }),
}));

jest.mock('../api/order.queries', () => ({
  useOrderDetailQuery: jest.fn(),
}));

jest.mock('../api/return.queries', () => ({
  useReturnReasonsQuery: jest.fn(() => ({ data: [], isPending: false, isError: false })),
  usePaymentMethodsQuery: jest.fn(() => ({ data: undefined, isPending: true })),
}));

jest.mock('../api/return.mutations', () => ({
  useSubmitReturnRequestMutation: jest.fn(() => ({ isPending: false, mutateAsync: jest.fn() })),
  useRecreateReturnAsPttMutation: jest.fn(() => ({ isPending: false, mutateAsync: jest.fn() })),
}));

jest.mock('./use-scheduled-return', () => ({
  useScheduledReturn: jest.fn(() => ({
    canSchedule: false,
    pickupSubmitting: false,
    selectedDate: null,
    submitPickup: jest.fn(),
    cancelPickup: jest.fn(),
  })),
}));

const { useOrderDetailQuery } = jest.requireMock('../api/order.queries') as {
  useOrderDetailQuery: jest.Mock;
};
const usePaymentMethodsQuery = returnQueries.usePaymentMethodsQuery as jest.MockedFunction<
  typeof returnQueries.usePaymentMethodsQuery
>;

function makeOrder(paymentMethodId: number) {
  return {
    id: 10,
    orderNo: 'HG-TEST-1',
    cargoCompanyName: 'PTT',
    paymentMethodId,
    canCreateReturnRequest: true,
    returnRequestIds: [],
    items: [
      {
        id: 101,
        quantity: 1,
        isNonReturnable: false,
        returnStatus: null,
        title: 'Test Ürün',
      },
    ],
  };
}

const OPTIONS = { preselectItemId: null, selectAll: false, enabled: true };

describe('useReturnCreateController — kartlı sipariş iade kilidi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Regression: kayıtlı IBAN sorgusu yalnızca kapıda ödeme siparişlerinde
  // etkinleşir; devre dışı sorgu TanStack Query'de sonsuza dek `isPending`
  // kaldığından, koşulsuz `!isPending` şartı kartlı siparişlerde onay
  // butonunu kalıcı olarak kilitliyordu.
  it('enables submit for a card-paid order even though the IBAN query never runs', () => {
    useOrderDetailQuery.mockReturnValue({
      data: makeOrder(6),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    usePaymentMethodsQuery.mockReturnValue({ data: undefined, isPending: true } as never);

    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    act(() => result.current.toggleItem('101-0'));
    act(() => result.current.setItemReason('101-0', 5));

    expect(result.current.shouldShowIbanSelect).toBe(false);
    expect(usePaymentMethodsQuery).toHaveBeenLastCalledWith(false);
    expect(result.current.canSubmit).toBe(true);
  });

  it('still waits for the saved IBAN list on a cash-on-delivery order', () => {
    useOrderDetailQuery.mockReturnValue({
      data: makeOrder(2),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    usePaymentMethodsQuery.mockReturnValue({ data: undefined, isPending: true } as never);

    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    act(() => result.current.toggleItem('101-0'));
    act(() => result.current.setItemReason('101-0', 5));

    expect(result.current.shouldShowIbanSelect).toBe(true);
    expect(usePaymentMethodsQuery).toHaveBeenLastCalledWith(true);
    expect(result.current.canSubmit).toBe(false);
  });
});
