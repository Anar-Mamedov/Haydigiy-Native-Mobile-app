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

describe('useReturnCreateController — paket (bundle) satırı', () => {
  /**
   * Paket, siparişte iki gerçek `order_item` satırından oluşur. İade ekranında TEK
   * satır olarak seçilir ama istek yine gerçek satır id'leriyle gönderilir.
   */
  const BUNDLE_ORDER = {
    id: 10,
    orderNo: 'HG-TEST-2',
    cargoCompanyName: 'PTT',
    paymentMethodId: 6,
    canCreateReturnRequest: true,
    returnRequestIds: [],
    items: [
      {
        id: 8801,
        quantity: 1,
        isNonReturnable: false,
        returnStatus: null,
        name: 'Kemer Detaylı Elbise',
        bundleGroupId: '101703d9',
        bundleProductId: 97045,
      },
      {
        id: 8802,
        quantity: 1,
        isNonReturnable: false,
        returnStatus: null,
        name: 'Kruvaze Ceket',
        bundleGroupId: '101703d9',
        bundleProductId: 97045,
      },
      {
        id: 9001,
        quantity: 1,
        isNonReturnable: false,
        returnStatus: null,
        name: 'Uzun Kollu Gömlek',
      },
    ],
    displayItems: [
      { id: 8801, quantity: 1, name: 'Deneme bundle', bundleGroupId: '101703d9', price: 2000 },
      { id: 9001, quantity: 1, name: 'Uzun Kollu Gömlek' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmit.mockResolvedValue({ return_code: 'IADE-2' });
    useOrderDetailQuery.mockReturnValue({
      data: BUNDLE_ORDER,
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('offers the package as one selectable row, not one row per product', () => {
    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    const ids = result.current.expandedItems.map((entry) => entry.expandedId);

    expect(ids).toEqual(['bundle:101703d9', '9001-0']);
    expect(result.current.expandedItems[0].isBundle).toBe(true);
    expect(result.current.expandedItems[0].components).toHaveLength(2);
  });

  it('submits the real order_item ids the package is made of', async () => {
    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    act(() => result.current.toggleItem('bundle:101703d9'));
    act(() => result.current.setItemReason('bundle:101703d9', 5));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockSubmit.mock.calls[0][0].items).toEqual([
      { orderItemId: 8801, quantity: 1, returnReasonId: 5, photo: null },
      { orderItemId: 8802, quantity: 1, returnReasonId: 5, photo: null },
    ]);
  });

  it('selects and deselects the package all at once', () => {
    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    act(() => result.current.toggleItem('bundle:101703d9'));
    expect(result.current.selectedItems).toEqual(['bundle:101703d9']);

    act(() => result.current.toggleItem('bundle:101703d9'));
    expect(result.current.selectedItems).toEqual([]);
  });

  it('leaves normal products on their own per-unit rows', async () => {
    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    act(() => result.current.toggleItem('9001-0'));
    act(() => result.current.setItemReason('9001-0', 5));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockSubmit.mock.calls[0][0].items).toEqual([
      { orderItemId: 9001, quantity: 1, returnReasonId: 5, photo: null },
    ]);
  });

  it('closes the whole package to returns when one component is non-returnable', () => {
    useOrderDetailQuery.mockReturnValue({
      data: {
        ...BUNDLE_ORDER,
        items: [
          { ...BUNDLE_ORDER.items[0], isNonReturnable: true },
          BUNDLE_ORDER.items[1],
          BUNDLE_ORDER.items[2],
        ],
      },
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    const bundleEntry = result.current.expandedItems.find(
      (entry) => entry.expandedId === 'bundle:101703d9',
    );

    expect(bundleEntry?.isNonReturnable).toBe(true);
  });
});
