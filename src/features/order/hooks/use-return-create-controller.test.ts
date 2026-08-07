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
  useRefundMethodsQuery: jest.fn(() => ({ data: undefined, isPending: true, isError: false })),
}));

const mockSubmit = jest.fn();

jest.mock('../api/return.mutations', () => ({
  useSubmitReturnRequestMutation: jest.fn(() => ({ isPending: false, mutateAsync: mockSubmit })),
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
const useRefundMethodsQuery = returnQueries.useRefundMethodsQuery as jest.MockedFunction<
  typeof returnQueries.useRefundMethodsQuery
>;

const IBAN_METHOD = { id: 1, name: 'IBAN', code: 'iban' };
const GIFT_VOUCHER_METHOD = { id: 2, name: 'Hediye Çeki', code: 'gift_voucher' };
const SAVED_IBAN = { id: 7, iban: 'TR000000000000000000000000', ibanName: 'Test Kullanıcı', isDefault: true };

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

describe('useReturnCreateController — iade yöntemi (IBAN / hediye çeki)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmit.mockResolvedValue({ return_code: 'IADE-1' });
  });

  function setup(paymentMethodId: number, refundMethods = [IBAN_METHOD, GIFT_VOUCHER_METHOD]) {
    useOrderDetailQuery.mockReturnValue({
      data: makeOrder(paymentMethodId),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    usePaymentMethodsQuery.mockReturnValue({
      data: [SAVED_IBAN],
      isPending: false,
      isError: false,
    } as never);
    useRefundMethodsQuery.mockReturnValue({
      data: refundMethods,
      isPending: false,
      isError: false,
    } as never);

    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));
    act(() => result.current.toggleItem('101-0'));
    act(() => result.current.setItemReason('101-0', 5));
    return result;
  }

  it('defaults to IBAN and submits its id alongside the IBAN fields', async () => {
    const result = setup(2);

    expect(result.current.refund.selectedId).toBe(IBAN_METHOD.id);
    expect(result.current.shouldCollectIban).toBe(true);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        refundMethodId: IBAN_METHOD.id,
        iban: SAVED_IBAN.iban,
        ibanName: SAVED_IBAN.ibanName,
      }),
    );
  });

  it('drops the IBAN requirement and fields once the gift voucher is picked', async () => {
    const result = setup(2);

    act(() => result.current.refund.select(GIFT_VOUCHER_METHOD.id));

    expect(result.current.refund.isGiftVoucher).toBe(true);
    expect(result.current.shouldCollectIban).toBe(false);
    expect(result.current.canSubmit).toBe(true);

    await act(async () => {
      await result.current.handleSubmit();
    });

    const payload = mockSubmit.mock.calls[0][0];
    expect(payload.refundMethodId).toBe(GIFT_VOUCHER_METHOD.id);
    expect(payload.iban).toBeUndefined();
    expect(payload.ibanName).toBeUndefined();
  });

  // Liste boş/hatalı dönerse ekran bugünkü haliyle kalır ve id gönderilmez;
  // backend `refund_method_id` gelmediğinde IBAN varsayar.
  it('hides the selector and omits the id when only one method comes back', async () => {
    const result = setup(2, [IBAN_METHOD]);

    expect(result.current.refund.showSelector).toBe(false);
    expect(result.current.shouldCollectIban).toBe(true);
  });

  it('never loads or sends a refund method for a card-paid order', async () => {
    const result = setup(6);

    expect(useRefundMethodsQuery).toHaveBeenLastCalledWith(false);
    expect(result.current.refund.showSelector).toBe(false);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockSubmit.mock.calls[0][0].refundMethodId).toBeUndefined();
  });
});
