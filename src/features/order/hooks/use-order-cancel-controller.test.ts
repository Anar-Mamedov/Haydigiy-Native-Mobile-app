import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useOrderCancelController } from './use-order-cancel-controller';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, replace: jest.fn() }),
}));

jest.mock('../api/order.queries', () => ({
  useOrderDetailQuery: jest.fn(),
  useCancellationReasonsQuery: jest.fn(() => ({
    data: [{ id: 5, name: 'Vazgeçtim' }],
    isPending: false,
    isError: false,
  })),
}));

const mockPreview = jest.fn();
const mockSubmit = jest.fn();

jest.mock('../api/order-cancel.mutations', () => ({
  usePreviewOrderCancelMutation: jest.fn(() => ({ isPending: false, mutateAsync: mockPreview })),
  useSubmitOrderCancelMutation: jest.fn(() => ({ isPending: false, mutateAsync: mockSubmit })),
}));

const { useOrderDetailQuery } = jest.requireMock('../api/order.queries') as {
  useOrderDetailQuery: jest.Mock;
};

/**
 * Paket, siparişte iki gerçek `order_item` satırından oluşur. İptal ekranında TEK
 * kartta gruplanır ama içindeki her ürün tek tek seçilebilir.
 */
const BUNDLE_ORDER = {
  id: 10,
  orderNo: 'HG-TEST-3',
  status: 'Onay Bekliyor',
  statusId: 1,
  items: [
    {
      id: 8801,
      quantity: 1,
      name: 'Kemer Detaylı Elbise',
      bundleGroupId: '101703d9',
      bundleProductId: 97045,
    },
    {
      id: 8802,
      quantity: 1,
      name: 'Kruvaze Ceket',
      bundleGroupId: '101703d9',
      bundleProductId: 97045,
    },
    { id: 9001, quantity: 1, name: 'Uzun Kollu Gömlek' },
  ],
  displayItems: [
    { id: 8801, quantity: 1, name: 'Deneme bundle', bundleGroupId: '101703d9', price: 2000 },
    { id: 9001, quantity: 1, name: 'Uzun Kollu Gömlek' },
  ],
};

const OPTIONS = { preselectItemId: null, selectAll: false, enabled: true };

function setup(order: unknown = BUNDLE_ORDER) {
  useOrderDetailQuery.mockReturnValue({
    data: order,
    isPending: false,
    isError: false,
    refetch: jest.fn(),
  });

  return renderHook(() => useOrderCancelController('10', OPTIONS));
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  mockPreview.mockResolvedValue({ cancellationBlocked: false, campaignWillBreak: false });
  mockSubmit.mockResolvedValue({ message: 'İptal talebiniz alındı.' });
});

describe('useOrderCancelController — paket (bundle) satırı', () => {
  it('groups the package into one card while every product stays selectable', () => {
    const { result } = setup();

    expect(result.current.itemGroups.map((group) => group.groupId)).toEqual([
      'bundle:101703d9',
      'item:9001',
    ]);
    expect(result.current.itemGroups[0].isBundle).toBe(true);
    expect(result.current.itemGroups[0].rows.map((row) => row.expandedId)).toEqual([
      '8801-0',
      '8802-0',
    ]);
    expect(result.current.expandedItems.map((row) => row.expandedId)).toEqual([
      '8801-0',
      '8802-0',
      '9001-0',
    ]);
  });

  it('cancels a single product out of the package', async () => {
    const { result } = setup();

    act(() => result.current.toggleSelect('8802-0'));
    act(() => result.current.setReason('8802-0', 5));

    await act(async () => {
      await result.current.cancel();
    });

    const expected = [{ orderItemId: 8802, quantity: 1, cancellationReasonId: 5 }];
    expect(mockPreview).toHaveBeenCalledWith({ id: '10', items: expected });
    expect(mockSubmit).toHaveBeenCalledWith({ id: '10', items: expected });
  });

  it('lets each package product carry its own cancellation reason', async () => {
    const { result } = setup();

    act(() => result.current.toggleSelect('8801-0'));
    act(() => result.current.toggleSelect('8802-0'));
    act(() => result.current.setReason('8801-0', 5));
    act(() => result.current.setReason('8802-0', 9));

    await act(async () => {
      await result.current.cancel();
    });

    expect(mockSubmit).toHaveBeenCalledWith({
      id: '10',
      items: [
        { orderItemId: 8801, quantity: 1, cancellationReasonId: 5 },
        { orderItemId: 8802, quantity: 1, cancellationReasonId: 9 },
      ],
    });
  });

  it('selects and clears the whole package from the group checkbox', () => {
    const { result } = setup();

    act(() => result.current.toggleGroup('bundle:101703d9'));
    expect(result.current.selectedIds).toEqual(['8801-0', '8802-0']);
    expect(result.current.selectedCount).toBe(2);

    act(() => result.current.toggleGroup('bundle:101703d9'));
    expect(result.current.selectedIds).toEqual([]);
  });

  it('completes the package when only part of it was selected', () => {
    const { result } = setup();

    act(() => result.current.toggleSelect('8801-0'));
    act(() => result.current.toggleGroup('bundle:101703d9'));

    expect(result.current.selectedIds).toEqual(['8801-0', '8802-0']);
  });

  it('leaves normal products on their own per-unit rows', async () => {
    const { result } = setup();

    act(() => result.current.toggleSelect('9001-0'));
    act(() => result.current.setReason('9001-0', 5));

    await act(async () => {
      await result.current.cancel();
    });

    expect(mockSubmit).toHaveBeenCalledWith({
      id: '10',
      items: [{ orderItemId: 9001, quantity: 1, cancellationReasonId: 5 }],
    });
  });

  it('drops the reason again when a package product is deselected', () => {
    const { result } = setup();

    act(() => result.current.toggleSelect('8801-0'));
    act(() => result.current.setReason('8801-0', 5));
    expect(result.current.allSelectedHaveReasons).toBe(true);

    act(() => result.current.toggleSelect('8801-0'));

    expect(result.current.itemReasons['8801-0']).toBeUndefined();
  });

  it('drops the reasons of every product when the package is cleared', () => {
    const { result } = setup();

    act(() => result.current.toggleGroup('bundle:101703d9'));
    act(() => result.current.toggleGroup('bundle:101703d9'));

    expect(result.current.itemReasons['8801-0']).toBeUndefined();
    expect(result.current.itemReasons['8802-0']).toBeUndefined();
  });

  it('applies the default reason to a freshly selected package product', () => {
    const { result } = setup();

    act(() => result.current.toggleSelect('8801-0'));

    // "Vazgeçtim" varsayılan neden olarak atanır; kullanıcı isterse değiştirir.
    expect(result.current.itemReasons['8801-0']).toBe(5);
    expect(result.current.allSelectedHaveReasons).toBe(true);
  });

  it('sends nothing and warns when no row is selected', async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.cancel();
    });

    expect(mockPreview).not.toHaveBeenCalled();
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Eksik Seçim',
      'Lütfen iptal etmek istediğiniz ürünleri ve iptal nedenini seçin.',
    );
  });

  it('stops at the warning step instead of cancelling the package silently', async () => {
    mockPreview.mockResolvedValue({ cancellationBlocked: false, campaignWillBreak: true });
    const { result } = setup();

    act(() => result.current.toggleGroup('bundle:101703d9'));

    await act(async () => {
      await result.current.cancel();
    });

    expect(result.current.showWarning).toBe(true);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('cancels every row, package products included', async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.cancelAll();
    });

    expect(mockSubmit).toHaveBeenCalledWith({
      id: '10',
      items: [
        { orderItemId: 8801, quantity: 1, cancellationReasonId: 5 },
        { orderItemId: 8802, quantity: 1, cancellationReasonId: 5 },
        { orderItemId: 9001, quantity: 1, cancellationReasonId: 5 },
      ],
    });
  });
});
