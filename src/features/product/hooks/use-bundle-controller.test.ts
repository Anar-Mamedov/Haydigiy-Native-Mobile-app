import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useBundleController } from './use-bundle-controller';
import { BundleItem } from '@/types/bundle.types';
import { Product } from '@/types/product.types';

const mockMutate = jest.fn();

jest.mock('@/features/cart/api/cart.queries', () => ({
  useAddBundleToCartMutation: () => ({ mutate: mockMutate, isPending: false }),
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
    price: 1250,
    oldPrice: null,
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

function renderController(product: Product | null, onAdded = jest.fn()) {
  const utils = renderHook(() => useBundleController(product, { onAdded }));
  return { ...utils, onAdded };
}

beforeEach(() => {
  jest.clearAllMocks();
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

  it('does nothing without a product', () => {
    const { result } = renderController(null);

    act(() => result.current.confirmAdd());

    expect(result.current.isBundle).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
