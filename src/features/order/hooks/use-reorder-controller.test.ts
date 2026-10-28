import { act, renderHook } from '@testing-library/react-native';
import { Alert, AlertButton } from 'react-native';
import { useReorderController } from './use-reorder-controller';
import { REORDER_FALLBACK_MESSAGES } from '../api/order-reorder.mapper';
import type { ReorderItem, ReorderResult } from '@/types/order.types';

const mockMutateAsync = jest.fn();
const mockGoToCart = jest.fn();
const mockMutationState: {
  isPending: boolean;
  variables?: { orderId: string; confirmed?: boolean };
} = { isPending: false };

jest.mock('../api/order-reorder.mutations', () => ({
  useReorderMutation: () => ({ mutateAsync: mockMutateAsync, ...mockMutationState }),
}));

jest.mock('@/features/cart/hooks/use-go-to-cart-after-add', () => ({
  useGoToCartAfterAdd: () => mockGoToCart,
}));

const ITEM: ReorderItem = {
  key: '11',
  orderItemId: 11,
  productId: 501,
  variantId: 9001,
  name: 'Kruvaze Ceket',
  variantName: 'M',
  slug: 'kruvaze-ceket',
  imageUrl: null,
  requestedQuantity: 1,
  currentStock: 0,
  price: 899.9,
};

const NEEDS_CONFIRMATION: ReorderResult = {
  kind: 'needsConfirmation',
  message: 'Bazı ürünler tükendi.',
  outOfStockItems: [{ ...ITEM, reason: 'Stok tükendi' }],
  availableItems: [{ ...ITEM, key: '12', currentStock: 5, addQuantity: 1, isPartialStock: false }],
};

const ADDED: ReorderResult = {
  kind: 'added',
  message: 'Stokta bulunan ürünler sepetinize eklendi.',
  cartCount: 3,
  addedItems: [],
  outOfStockItems: [],
  failedCount: 0,
};

const ALL_OUT_OF_STOCK: ReorderResult = {
  kind: 'allOutOfStock',
  message: 'Siparişinizdeki ürünlerin hiçbiri şu anda stokta bulunmamaktadır.',
  outOfStockItems: [],
};

function setup() {
  return renderHook(() => useReorderController('42'));
}

async function press(action: () => Promise<void>) {
  await act(async () => {
    await action();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  mockMutationState.isPending = false;
  mockMutationState.variables = undefined;
});

describe('useReorderController', () => {
  it('adds everything in one step and offers to open the cart', async () => {
    mockMutateAsync.mockResolvedValueOnce(ADDED);
    const { result } = setup();

    await press(result.current.start);

    expect(mockMutateAsync).toHaveBeenCalledWith({ orderId: '42', confirmed: false });
    expect(result.current.isConfirmationOpen).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Başarılı',
      'Stokta bulunan ürünler sepetinize eklendi.',
      expect.any(Array),
    );

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as AlertButton[];
    expect(buttons.map((button) => button.text)).toEqual(['Alışverişe Devam Et', 'Sepete Git']);
    buttons[1].onPress?.();
    expect(mockGoToCart).toHaveBeenCalledTimes(1);
  });

  it('asks the customer first when some lines sold out', async () => {
    mockMutateAsync.mockResolvedValueOnce(NEEDS_CONFIRMATION);
    const { result } = setup();

    await press(result.current.start);

    expect(result.current.isConfirmationOpen).toBe(true);
    expect(result.current.confirmation).toBe(NEEDS_CONFIRMATION);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('adds the in-stock lines once the customer confirms', async () => {
    mockMutateAsync.mockResolvedValueOnce(NEEDS_CONFIRMATION).mockResolvedValueOnce(ADDED);
    const { result } = setup();

    await press(result.current.start);
    await press(result.current.confirm);

    expect(mockMutateAsync).toHaveBeenLastCalledWith({ orderId: '42', confirmed: true });
    expect(result.current.isConfirmationOpen).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith('Başarılı', ADDED.message, expect.any(Array));
  });

  // Onay beklerken kalan stok da tükenirse backend 422 döner; sheet kapanır, mesaj gösterilir.
  it('closes the sheet and explains when the stock vanished before confirming', async () => {
    mockMutateAsync
      .mockResolvedValueOnce(NEEDS_CONFIRMATION)
      .mockResolvedValueOnce(ALL_OUT_OF_STOCK);
    const { result } = setup();

    await press(result.current.start);
    await press(result.current.confirm);

    expect(result.current.isConfirmationOpen).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith('Hata', ALL_OUT_OF_STOCK.message);
  });

  it('shows the backend message when nothing is in stock', async () => {
    mockMutateAsync.mockResolvedValueOnce(ALL_OUT_OF_STOCK);
    const { result } = setup();

    await press(result.current.start);

    expect(result.current.isConfirmationOpen).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith('Hata', ALL_OUT_OF_STOCK.message);
  });

  it('reports an unrecognised answer instead of doing nothing', async () => {
    mockMutateAsync.mockResolvedValueOnce({ kind: 'failed', message: 'İşlem yapılamadı.' });
    const { result } = setup();

    await press(result.current.start);

    expect(Alert.alert).toHaveBeenCalledWith('Hata', 'İşlem yapılamadı.');
  });

  it('shows the backend message of a failed request, else a generic Turkish one', async () => {
    mockMutateAsync
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404, data: { message: 'Sipariş bulunamadı.' } },
      })
      .mockRejectedValueOnce({ isAxiosError: true, code: 'ERR_NETWORK', message: 'Network Error' });
    const { result } = setup();

    await press(result.current.start);
    expect(Alert.alert).toHaveBeenLastCalledWith('Hata', 'Sipariş bulunamadı.');

    await press(result.current.start);
    expect(Alert.alert).toHaveBeenLastCalledWith('Hata', REORDER_FALLBACK_MESSAGES.failed);
  });

  it('closes the sheet when the confirmed request fails', async () => {
    mockMutateAsync
      .mockResolvedValueOnce(NEEDS_CONFIRMATION)
      .mockRejectedValueOnce(new Error('timeout'));
    const { result } = setup();

    await press(result.current.start);
    await press(result.current.confirm);

    expect(result.current.isConfirmationOpen).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith('Hata', REORDER_FALLBACK_MESSAGES.failed);
  });

  it('keeps the lists while the dismissed sheet animates closed', async () => {
    mockMutateAsync.mockResolvedValueOnce(NEEDS_CONFIRMATION);
    const { result } = setup();

    await press(result.current.start);
    act(() => result.current.dismiss());

    expect(result.current.isConfirmationOpen).toBe(false);
    expect(result.current.confirmation).toBe(NEEDS_CONFIRMATION);
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
  });

  // Çift dokunuş siparişi sepete iki kez eklememeli.
  it('ignores a second tap and a dismissal while a request is running', async () => {
    let resolveConfirm: (value: ReorderResult) => void = () => undefined;
    mockMutateAsync.mockResolvedValueOnce(NEEDS_CONFIRMATION).mockReturnValueOnce(
      new Promise<ReorderResult>((resolve) => {
        resolveConfirm = resolve;
      }),
    );
    const { result } = setup();

    await press(result.current.start);

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.confirm();
    });
    await press(result.current.confirm);
    act(() => result.current.dismiss());

    expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    expect(result.current.isConfirmationOpen).toBe(true);

    await act(async () => {
      resolveConfirm(ADDED);
      await pending;
    });
    expect(result.current.isConfirmationOpen).toBe(false);
  });

  it('tells which request is running', () => {
    mockMutationState.isPending = true;
    mockMutationState.variables = { orderId: '42', confirmed: false };
    const { result, rerender } = setup();

    expect(result.current.isPending).toBe(true);
    expect(result.current.isConfirming).toBe(false);

    mockMutationState.variables = { orderId: '42', confirmed: true };
    rerender({});
    expect(result.current.isConfirming).toBe(true);
  });
});
