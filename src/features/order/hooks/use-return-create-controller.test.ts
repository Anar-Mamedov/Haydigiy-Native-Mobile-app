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
const mockRecreate = jest.fn();

jest.mock('../api/return.mutations', () => ({
  useSubmitReturnRequestMutation: jest.fn(() => ({ isPending: false, mutateAsync: mockSubmit })),
  useRecreateReturnAsPttMutation: jest.fn(() => ({ isPending: false, mutateAsync: mockRecreate })),
}));

jest.mock('./use-scheduled-return', () => ({
  formatPickupDate: (iso: string) => `tarih:${iso}`,
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
   * kartta gruplanır ama içindeki her ürün tek tek iade edilebilir.
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

  it('groups the package into one card while every product stays selectable', () => {
    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    expect(result.current.returnableGroups.map((group) => group.groupId)).toEqual([
      'bundle:101703d9',
      'item:9001',
    ]);
    expect(result.current.returnableGroups[0].isBundle).toBe(true);
    expect(result.current.returnableGroups[0].rows.map((row) => row.expandedId)).toEqual([
      '8801-0',
      '8802-0',
    ]);
  });

  it('returns a single product out of the package', async () => {
    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    act(() => result.current.toggleItem('8802-0'));
    act(() => result.current.setItemReason('8802-0', 5));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockSubmit.mock.calls[0][0].items).toEqual([
      { orderItemId: 8802, quantity: 1, returnReasonId: 5, photo: null },
    ]);
  });

  it('lets each package product carry its own return reason', async () => {
    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    act(() => result.current.toggleGroup('bundle:101703d9'));
    act(() => result.current.setItemReason('8801-0', 5));
    act(() => result.current.setItemReason('8802-0', 9));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockSubmit.mock.calls[0][0].items).toEqual([
      { orderItemId: 8801, quantity: 1, returnReasonId: 5, photo: null },
      { orderItemId: 8802, quantity: 1, returnReasonId: 9, photo: null },
    ]);
  });

  it('selects and clears the whole package from the group checkbox', () => {
    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    act(() => result.current.toggleGroup('bundle:101703d9'));
    expect(result.current.selectedItems).toEqual(['8801-0', '8802-0']);

    act(() => result.current.toggleGroup('bundle:101703d9'));
    expect(result.current.selectedItems).toEqual([]);
  });

  it('completes the package when only part of it was selected', () => {
    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    act(() => result.current.toggleItem('8801-0'));
    act(() => result.current.toggleGroup('bundle:101703d9'));

    expect(result.current.selectedItems).toEqual(['8801-0', '8802-0']);
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

  it('drops only the non-returnable product and keeps the rest of the package open', () => {
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

    const bundleGroup = result.current.returnableGroups.find(
      (group) => group.groupId === 'bundle:101703d9',
    );

    expect(bundleGroup?.rows.map((row) => row.orderItemId)).toEqual([8802]);
  });

  it('preselects the whole package when the order detail opens one of its products', () => {
    const { result } = renderHook(() =>
      useReturnCreateController('10', { ...OPTIONS, preselectItemId: 8801 }),
    );

    expect(result.current.selectedItems).toEqual(['8801-0', '8802-0']);
  });
});

describe('useReturnCreateController — iade onayı', () => {
  const useReturnReasonsQuery = returnQueries.useReturnReasonsQuery as jest.MockedFunction<
    typeof returnQueries.useReturnReasonsQuery
  >;

  const ORDER = {
    id: 10,
    orderNo: 'HG-TEST-3',
    cargoCompanyName: 'PTT',
    paymentMethodId: 2,
    canCreateReturnRequest: true,
    returnRequestIds: [],
    items: [
      {
        id: 101,
        quantity: 2,
        isNonReturnable: false,
        returnStatus: 'available',
        name: 'Pijama Takımı',
        variantName: 'S-M',
        image: 'https://cdn/pijama.webp',
      },
    ],
  };

  function setup() {
    useOrderDetailQuery.mockReturnValue({ data: ORDER, isPending: false, isError: false, refetch: jest.fn() });
    useReturnReasonsQuery.mockReturnValue({
      data: [{ id: 5, name: 'Beden büyük geldi' }],
      isPending: false,
      isError: false,
    } as never);
    usePaymentMethodsQuery.mockReturnValue({ data: [SAVED_IBAN], isPending: false, isError: false } as never);
    useRefundMethodsQuery.mockReturnValue({
      data: [IBAN_METHOD, GIFT_VOUCHER_METHOD],
      isPending: false,
      isError: false,
    } as never);

    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));
    act(() => result.current.toggleItem('101-0'));
    act(() => result.current.toggleItem('101-1'));
    return result;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmit.mockResolvedValue({ return_code: 'IADE-3' });
  });

  afterEach(() => {
    useReturnReasonsQuery.mockReturnValue({ data: [], isPending: false, isError: false } as never);
  });

  it('summarises the selected products, reasons and refund details for the review sheet', () => {
    const result = setup();
    act(() => result.current.setNote('  Kargo poşetiyle göndereceğim.  '));

    expect(result.current.confirmSummary.items).toEqual([
      {
        key: '101:5',
        name: 'Pijama Takımı',
        variantName: 'S-M',
        imageUrl: 'https://cdn/pijama.webp',
        quantity: 2,
        reasonName: 'Beden büyük geldi',
        isGift: false,
      },
    ]);
    expect(result.current.confirmSummary.details).toEqual([
      { label: 'İade Yöntemi', value: 'PTT Kargo Şubesinden Gönder' },
      { label: 'Geri Ödeme', value: 'IBAN' },
      { label: "İade IBAN'ı", value: 'TR00 0000 0000 0000 0000 0000 00' },
      { label: 'IBAN Sahibi', value: 'Test Kullanıcı' },
      { label: 'Not', value: 'Kargo poşetiyle göndereceğim.' },
    ]);
  });

  // İade isteği butona basınca değil, kullanıcı özeti onaylayınca gider.
  it('opens the review first and submits only after the user confirms', async () => {
    const result = setup();
    expect(result.current.canSubmit).toBe(true);

    act(() => result.current.confirmation.request());
    expect(result.current.confirmation.open).toBe(true);
    expect(mockSubmit).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.confirmation.confirm();
    });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit.mock.calls[0][0].items).toEqual([
      { orderItemId: 101, quantity: 1, returnReasonId: 5, photo: null },
      { orderItemId: 101, quantity: 1, returnReasonId: 5, photo: null },
    ]);
    expect(result.current.confirmation.open).toBe(false);
    expect(result.current.successMessage).toContain('IADE-3');
  });

  it('closes the review without sending anything when the user cancels', () => {
    const result = setup();

    act(() => result.current.confirmation.request());
    act(() => result.current.confirmation.close());

    expect(result.current.confirmation.open).toBe(false);
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});

describe('useReturnCreateController — hata sonrası yeniden deneme ve PTT geri dönüşü', () => {
  const HEPSIJET_ERROR = 'HepsiJet: bu gönderi sistemde kayıtlı.';

  function setup(returnRequestIds: number[] = []) {
    useOrderDetailQuery.mockReturnValue({
      data: { ...makeOrder(6), returnRequestIds },
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));
    act(() => result.current.toggleItem('101-0'));
    act(() => result.current.setItemReason('101-0', 5));
    return result;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Web c2ca07b76: genel hata sheet'indeki "Yeniden dene" talebi aynı seçimlerle tekrar gönderir.
  it('re-submits the same request from the error sheet and shows the success on retry', async () => {
    mockSubmit
      .mockRejectedValueOnce(new Error('Sunucu hatası'))
      .mockResolvedValueOnce({ return_code: 'IADE-9' });
    const result = setup();

    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.errorMessage).toBe('Sunucu hatası');

    await act(async () => {
      result.current.retrySubmit();
    });

    expect(mockSubmit).toHaveBeenCalledTimes(2);
    expect(mockSubmit.mock.calls[1][0]).toEqual(mockSubmit.mock.calls[0][0]);
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.successMessage).toContain('IADE-9');
  });

  it('reopens the error with the new message when the retry fails again', async () => {
    mockSubmit
      .mockRejectedValueOnce(new Error('İlk hata'))
      .mockRejectedValueOnce(new Error('İkinci hata'));
    const result = setup();

    await act(async () => {
      await result.current.handleSubmit();
    });
    await act(async () => {
      result.current.retrySubmit();
    });

    expect(result.current.errorMessage).toBe('İkinci hata');
  });

  it('does nothing on retry while the form cannot be submitted', async () => {
    useOrderDetailQuery.mockReturnValue({
      data: makeOrder(6),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useReturnCreateController('10', OPTIONS));

    await act(async () => {
      result.current.retrySubmit();
    });

    expect(result.current.canSubmit).toBe(false);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  // Web 4c4a2194e: PTT ile yeniden oluşturulan talepte başarı ekranı Hepsijet bilgisi göstermez.
  it('marks the method as PTT after converting the existing request', async () => {
    mockSubmit.mockRejectedValueOnce(new Error(HEPSIJET_ERROR));
    mockRecreate.mockResolvedValueOnce({ return_code: 'PTT-1' });
    const result = setup([31, 35]);

    act(() => result.current.setReturnMethod('hepsijet'));
    expect(result.current.returnMethod).toBe('hepsijet');

    await act(async () => {
      await result.current.handleRecreatePtt();
    });

    expect(mockRecreate).toHaveBeenCalledWith({
      returnRequestId: 35,
      payload: expect.objectContaining({ cargoCompany: 'ptt', orderId: 10 }),
    });
    expect(result.current.returnMethod).toBe('ptt');
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.successMessage).toBe(
      'İade talebiniz başarıyla PTT kargo ile güncellendi.\nİade Kodunuz: PTT-1',
    );
  });

  it('marks the method as PTT when the request is re-submitted as a new PTT return', async () => {
    mockRecreate.mockResolvedValueOnce({ return_code: 'PTT-2', expires_at: '2026-10-20' });
    const result = setup([]);

    act(() => result.current.setReturnMethod('hepsijet'));
    await act(async () => {
      await result.current.handleRecreatePtt();
    });

    expect(mockRecreate.mock.calls[0][0].returnRequestId).toBeNull();
    expect(mockRecreate.mock.calls[0][0].payload.items).toEqual([
      { orderItemId: 101, quantity: 1, returnReasonId: 5, photo: null },
    ]);
    expect(result.current.returnMethod).toBe('ptt');
    expect(result.current.successMessage).toBe(
      'İade talebiniz alındı.\nİade Kodunuz: PTT-2\nKod geçerlilik: 2026-10-20',
    );
  });

  it('keeps the chosen method and surfaces the error when the PTT fallback fails', async () => {
    mockRecreate.mockRejectedValueOnce(new Error('PTT servisi yanıt vermedi'));
    const result = setup([35]);

    act(() => result.current.setReturnMethod('hepsijet'));
    await act(async () => {
      await result.current.handleRecreatePtt();
    });

    expect(result.current.returnMethod).toBe('hepsijet');
    expect(result.current.errorMessage).toBe('PTT servisi yanıt vermedi');
    expect(result.current.successMessage).toBeNull();
  });
});
