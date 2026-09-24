import { act, renderHook, waitFor } from '@testing-library/react-native';
import { SINGLE_ADDED_FEEDBACK_MS, useBundleController } from './use-bundle-controller';
import { BundleItem } from '@/types/bundle.types';
import { Product } from '@/types/product.types';

const mockMutate = jest.fn();
const mockAddToCart = jest.fn();
let mockIsAddingSingle = false;

jest.mock('@/features/cart/api/cart.queries', () => ({
  useAddBundleToCartMutation: () => ({ mutate: mockMutate, isPending: false }),
  useAddToCartMutation: () => ({ mutate: mockAddToCart, isPending: mockIsAddingSingle }),
}));

jest.mock('@/features/insider/utils/insider-product.mapper', () => ({
  productToInsiderInput: jest.fn(() => ({
    id: '97045',
    name: 'Deneme bundle',
    taxonomy: ['Paket'],
    imageUrl: '',
    price: 2000,
    currency: 'TRY',
  })),
  buildInsiderInput: jest.fn((partial) => partial),
}));

function makeBundleItem(bundleItemId: number, sizes: { id: string; stock: number }[]): BundleItem {
  const variants = sizes.map((size, index) => ({
    key: `${size.id}-${index}`,
    variantId: size.id,
    name: size.id,
    name2: null,
    stock: size.stock,
    hasStock: size.stock > 0,
  }));

  return {
    bundleItemId,
    productId: bundleItemId * 10,
    title: `Ürün ${bundleItemId}`,
    slug: null,
    imageUrl: '',
    // Paket içi fiyat normal fiyattan düşük: "Tekli Satın Al" hangisini kullandığı ayırt edilebilsin.
    price: 1100,
    oldPrice: 1250,
    regularUnitPrice: 1250,
    quantity: 1,
    isAvailable: variants.some((variant) => variant.hasStock),
    variants,
  };
}

const SINGLE_SIZE_ITEM = makeBundleItem(12, [{ id: '3510', stock: 5 }]);
const MULTI_SIZE_ITEM = makeBundleItem(13, [
  { id: '3577', stock: 2 },
  { id: '3578', stock: 3 },
]);

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '97045',
    title: 'Deneme bundle',
    price: 2000,
    imageUrl: '',
    isBundle: true,
    bundleItems: [SINGLE_SIZE_ITEM],
    bundleSummary: {
      itemCount: 1,
      itemsTotal: 2500,
      bundlePrice: 2000,
      savings: 500,
      savingsPercent: 20,
      isSellable: true,
      maxQuantity: 10,
    },
    ...overrides,
  } as Product;
}

function renderController(product: Product | null, onAdded = jest.fn(), onOpenProduct = jest.fn()) {
  const utils = renderHook(() => useBundleController(product, { onAdded, onOpenProduct }));
  return { ...utils, onAdded, onOpenProduct };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAddingSingle = false;
});

describe('useBundleController', () => {
  it('treats a normal product as a non-bundle', () => {
    const { result } = renderController(makeProduct({ isBundle: false }));

    expect(result.current.isBundle).toBe(false);
  });

  it('treats a package with no items as a non-bundle', () => {
    const { result } = renderController(makeProduct({ bundleItems: [] }));

    expect(result.current.isBundle).toBe(false);
  });

  it('exposes the package items and summary', () => {
    const { result } = renderController(makeProduct());

    expect(result.current.isBundle).toBe(true);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.summary?.bundlePrice).toBe(2000);
  });

  it('opens and closes the size sheet', () => {
    const { result } = renderController(makeProduct());

    expect(result.current.isSheetOpen).toBe(false);

    act(() => result.current.openSheet());
    expect(result.current.isSheetOpen).toBe(true);

    act(() => result.current.closeSheet());
    expect(result.current.isSheetOpen).toBe(false);
  });

  it('sends no request while a size is still missing', () => {
    const { result } = renderController(
      makeProduct({ bundleItems: [SINGLE_SIZE_ITEM, MULTI_SIZE_ITEM] }),
    );

    act(() => result.current.confirmAdd());

    expect(mockMutate).not.toHaveBeenCalled();
    // Eksik kalem vurgulanır, alt sayfa açık kalır.
    expect(result.current.selection.missingHighlight).toBe(true);
    expect(result.current.selection.missingItemIds).toEqual([13]);
  });

  it('posts the package with every selection once the sizes are complete', () => {
    const { result } = renderController(
      makeProduct({ bundleItems: [SINGLE_SIZE_ITEM, MULTI_SIZE_ITEM] }),
    );

    act(() => result.current.selection.selectVariant(13, '3578'));
    act(() => result.current.confirmAdd());

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0]).toEqual({
      bundleProductId: '97045',
      quantity: 1,
      selections: [
        { bundleItemId: 12, variantId: '3510' },
        { bundleItemId: 13, variantId: '3578' },
      ],
      tracking: expect.objectContaining({ id: '97045' }),
    });
  });

  it('goes to the cart only after the request succeeds', () => {
    const { result, onAdded } = renderController(makeProduct());

    act(() => result.current.confirmAdd());
    expect(onAdded).not.toHaveBeenCalled();

    act(() => mockMutate.mock.calls[0][1].onSuccess());

    expect(onAdded).toHaveBeenCalledTimes(1);
    expect(result.current.isSheetOpen).toBe(false);
  });

  it('surfaces the backend message and keeps the sheet open when adding fails', async () => {
    const { result, onAdded } = renderController(makeProduct());

    act(() => result.current.openSheet());
    act(() => result.current.confirmAdd());
    act(() =>
      mockMutate.mock.calls[0][1].onError({
        isAxiosError: true,
        response: { status: 400, data: { message: 'Paket stokta kalmadı.' } },
      }),
    );

    await waitFor(() => expect(result.current.errorMessage).toBe('Paket stokta kalmadı.'));
    expect(result.current.isSheetOpen).toBe(true);
    expect(onAdded).not.toHaveBeenCalled();
  });

  it('falls back to a readable message when the backend sends none', async () => {
    const { result } = renderController(makeProduct());

    act(() => result.current.confirmAdd());
    act(() => mockMutate.mock.calls[0][1].onError({ isAxiosError: true, response: { status: 500 } }));

    await waitFor(() =>
      expect(result.current.errorMessage).toBe('Paket sepete eklenemedi. Lütfen tekrar deneyin.'),
    );
  });

  it('clears a previous error when the sheet is closed', async () => {
    const { result } = renderController(makeProduct());

    act(() => result.current.confirmAdd());
    act(() => mockMutate.mock.calls[0][1].onError(new Error('Network Error')));
    await waitFor(() =>
      expect(result.current.errorMessage).toBe('Paket sepete eklenemedi. Lütfen tekrar deneyin.'),
    );

    act(() => result.current.closeSheet());

    expect(result.current.errorMessage).toBeNull();
  });

  it('clears a previous error before retrying', async () => {
    const { result } = renderController(makeProduct());

    act(() => result.current.confirmAdd());
    act(() => mockMutate.mock.calls[0][1].onError(new Error('Network Error')));
    await waitFor(() => expect(result.current.errorMessage).not.toBeNull());

    act(() => result.current.confirmAdd());

    expect(result.current.errorMessage).toBeNull();
    expect(mockMutate).toHaveBeenCalledTimes(2);
  });

  it('closes the sheet and opens the package item by its slug', () => {
    const { result, onOpenProduct } = renderController(makeProduct());

    act(() => result.current.openSheet());
    act(() => result.current.openItemProduct({ ...SINGLE_SIZE_ITEM, slug: 'kemer-detayli-elbise' }));

    // Modal alt sayfa açık kalsaydı yeni ürün ekranının üstünde görünürdü.
    expect(result.current.isSheetOpen).toBe(false);
    expect(onOpenProduct).toHaveBeenCalledWith('kemer-detayli-elbise');
  });

  it('keeps the sheet open when the package item has no product page', () => {
    const { result, onOpenProduct } = renderController(makeProduct());

    act(() => result.current.openSheet());
    act(() => result.current.openItemProduct(SINGLE_SIZE_ITEM));

    expect(result.current.isSheetOpen).toBe(true);
    expect(onOpenProduct).not.toHaveBeenCalled();
  });

  it('adds the item with its picked size alone to the cart', () => {
    const { result, onAdded } = renderController(makeProduct());

    act(() => result.current.openSheet());
    act(() => result.current.selection.selectVariant(12, '3510'));
    act(() => result.current.buySingleItem(SINGLE_SIZE_ITEM));

    // Paket değil yalnızca bu kalem; sepete ürüne özel `product_variant_id` gider.
    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart.mock.calls[0][0]).toEqual({
      variantId: '3510',
      tracking: expect.objectContaining({ id: '120', name: 'Ürün 12', size: '3510', quantity: 1 }),
    });
    expect(result.current.buyingItemId).toBe(12);

    act(() => mockAddToCart.mock.calls[0][1].onSuccess());
    act(() => mockAddToCart.mock.calls[0][1].onSettled());

    // Webdeki gibi sepete geçilmez: alt sayfa açık kalır, kalem "eklendi" olarak işaretlenir.
    expect(onAdded).not.toHaveBeenCalled();
    expect(result.current.isSheetOpen).toBe(true);
    expect(result.current.buyingItemId).toBeNull();
    expect(result.current.addedItemId).toBe(12);
  });

  it('shows the single-add confirmation only for a moment', () => {
    jest.useFakeTimers();
    try {
      const { result } = renderController(makeProduct());

      act(() => result.current.selection.selectVariant(12, '3510'));
      act(() => result.current.buySingleItem(SINGLE_SIZE_ITEM));
      act(() => mockAddToCart.mock.calls[0][1].onSuccess());

      expect(result.current.addedItemId).toBe(12);

      act(() => jest.advanceTimersByTime(SINGLE_ADDED_FEEDBACK_MS - 1));
      expect(result.current.addedItemId).toBe(12);

      act(() => jest.advanceTimersByTime(1));
      expect(result.current.addedItemId).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('drops the single-add confirmation when the sheet is closed', () => {
    const { result } = renderController(makeProduct());

    act(() => result.current.openSheet());
    act(() => result.current.selection.selectVariant(12, '3510'));
    act(() => result.current.buySingleItem(SINGLE_SIZE_ITEM));
    act(() => mockAddToCart.mock.calls[0][1].onSuccess());
    act(() => result.current.closeSheet());

    expect(result.current.addedItemId).toBeNull();
  });

  it('does not confirm the single add when the request fails', () => {
    const { result } = renderController(makeProduct());

    act(() => result.current.selection.selectVariant(12, '3510'));
    act(() => result.current.buySingleItem(SINGLE_SIZE_ITEM));
    act(() => mockAddToCart.mock.calls[0][1].onError(new Error('network')));

    expect(result.current.addedItemId).toBeNull();
  });

  it('reports the regular unit price, not the package price, for the single add', () => {
    const { result } = renderController(makeProduct());

    act(() => result.current.selection.selectVariant(12, '3510'));
    act(() => result.current.buySingleItem(SINGLE_SIZE_ITEM));

    // Kalem paketsiz eklenir; sepete yansıyan bedel normal fiyattır.
    expect(mockAddToCart.mock.calls[0][0].tracking).toEqual(expect.objectContaining({ price: 1250 }));
  });

  it('opens the product instead when no size is picked for the item', () => {
    // Tek bedenli kalemin bedeni otomatik seçildiği için iki bedenli kalem kullanılır.
    const { result, onOpenProduct } = renderController(
      makeProduct({ bundleItems: [SINGLE_SIZE_ITEM, MULTI_SIZE_ITEM] }),
    );

    act(() => result.current.openSheet());
    act(() => result.current.buySingleItem({ ...MULTI_SIZE_ITEM, slug: 'kruvaze-ceket' }));

    expect(mockAddToCart).not.toHaveBeenCalled();
    expect(onOpenProduct).toHaveBeenCalledWith('kruvaze-ceket');
    expect(result.current.isSheetOpen).toBe(false);
  });

  it('keeps the sheet open with the backend message when the single add fails', async () => {
    const { result, onAdded } = renderController(makeProduct());

    act(() => result.current.openSheet());
    act(() => result.current.selection.selectVariant(12, '3510'));
    act(() => result.current.buySingleItem(SINGLE_SIZE_ITEM));
    act(() =>
      mockAddToCart.mock.calls[0][1].onError({
        isAxiosError: true,
        response: { status: 400, data: { message: 'Bu bedenin stoğu kalmadı.' } },
      }),
    );

    await waitFor(() => expect(result.current.errorMessage).toBe('Bu bedenin stoğu kalmadı.'));
    expect(result.current.isSheetOpen).toBe(true);
    expect(onAdded).not.toHaveBeenCalled();
  });

  it('ignores Tekli Satın Al while a single add is already running', () => {
    mockIsAddingSingle = true;
    const { result, onOpenProduct } = renderController(makeProduct());

    act(() => result.current.selection.selectVariant(12, '3510'));
    act(() => result.current.buySingleItem(SINGLE_SIZE_ITEM));
    act(() => result.current.buySingleItem({ ...MULTI_SIZE_ITEM, slug: 'kruvaze-ceket' }));

    // Çift dokunma ikinci isteği göndermez, istek sürerken başka ekrana da geçilmez.
    expect(mockAddToCart).not.toHaveBeenCalled();
    expect(onOpenProduct).not.toHaveBeenCalled();
  });

  it('does nothing without a product', () => {
    const { result } = renderController(null);

    act(() => result.current.confirmAdd());

    expect(result.current.isBundle).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
