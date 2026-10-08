import { createElement, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { getProductDetailBySlug } from '@/services/product.service';
import { ShowcaseProduct } from '../api/product-showcase.mapper';
import { useShowcaseQuickAdd } from './use-showcase-quick-add';

const mockPush = jest.fn();
const mockAddToCart = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/cart/api/cart.queries', () => ({
  useAddToCartMutation: () => ({ isPending: false, mutate: mockAddToCart }),
}));

jest.mock('@/services/product.service', () => ({
  getCurrentSlugById: jest.fn(),
  getProductDetailBySlug: jest.fn(),
}));

// Ham DTO yerine ürün modelini doğrudan döndürür; eşleme kendi testinde.
jest.mock('../api/product.mapper', () => ({
  mapProductDetailDto: (dto: unknown) => dto,
}));

const getProductDetailBySlugMock = getProductDetailBySlug as jest.MockedFunction<typeof getProductDetailBySlug>;

const SIZE_M = { hasStock: true, id: '101', name: 'M', pivotId: '4321', price: 0, quantity: 5 };

const showcaseProduct: ShowcaseProduct = {
  hasDiscount: false,
  id: '39561',
  imageUrl: 'https://cdn.example.com/pantolon.webp',
  price: 219.99,
  slug: 'dabil-bagcikli-pantolon',
  title: 'Dabıl Bağcıklı Pantolon',
};

function makeDetail(overrides: Record<string, unknown> = {}) {
  return {
    brand: 'HaydiGiy',
    category: 'Pantolon',
    currency: 'TRY',
    id: '39561',
    imageUrl: 'https://cdn.example.com/pantolon.webp',
    price: 219.99,
    slug: 'dabil-bagcikli-pantolon',
    title: 'Dabıl Bağcıklı Pantolon',
    variants: [SIZE_M],
    ...overrides,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

describe('useShowcaseQuickAdd', () => {
  it('opens the sheet immediately and loads the sizes by slug', async () => {
    getProductDetailBySlugMock.mockResolvedValue(makeDetail() as never);
    const { result } = renderHook(() => useShowcaseQuickAdd(), { wrapper });

    act(() => result.current.open(showcaseProduct));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.isLoadingVariants).toBe(true);
    expect(result.current.pricing?.price).toBe(219.99);

    await waitFor(() => expect(result.current.isLoadingVariants).toBe(false));
    expect(getProductDetailBySlugMock).toHaveBeenCalledWith('dabil-bagcikli-pantolon');
    expect(result.current.detail?.variants).toEqual([SIZE_M]);
  });

  it('adds the selected size to the cart with the pivot id and closes the sheet', async () => {
    getProductDetailBySlugMock.mockResolvedValue(makeDetail() as never);
    const { result } = renderHook(() => useShowcaseQuickAdd(), { wrapper });

    act(() => result.current.open(showcaseProduct));
    await waitFor(() => expect(result.current.detail).toBeTruthy());
    act(() => result.current.setSelectedVariant(SIZE_M));
    act(() => result.current.confirm());

    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        tracking: expect.objectContaining({ id: '39561', quantity: 1, size: 'M' }),
        variantId: '4321',
      }),
      expect.any(Object),
    );
    expect(result.current.isOpen).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('offers to go to the cart once the item is added', async () => {
    getProductDetailBySlugMock.mockResolvedValue(makeDetail() as never);
    mockAddToCart.mockImplementation((_variables, options) => options.onSuccess());
    const { result } = renderHook(() => useShowcaseQuickAdd(), { wrapper });

    act(() => result.current.open(showcaseProduct));
    await waitFor(() => expect(result.current.detail).toBeTruthy());
    act(() => result.current.setSelectedVariant(SIZE_M));
    act(() => result.current.confirm());

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    expect((Alert.alert as jest.Mock).mock.calls[0][1]).toBe('Dabıl Bağcıklı Pantolon (M) sepetinize eklendi.');
    buttons[1].onPress();
    expect(mockPush).toHaveBeenCalledWith('/cart');
  });

  it('sends bundles to the detail screen instead of the size sheet', async () => {
    getProductDetailBySlugMock.mockResolvedValue(makeDetail({ isBundle: true }) as never);
    const { result } = renderHook(() => useShowcaseQuickAdd(), { wrapper });

    act(() => result.current.open(showcaseProduct));

    await waitFor(() => expect(result.current.isOpen).toBe(false));
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({ params: expect.objectContaining({ id: 'dabil-bagcikli-pantolon' }) }),
    );
  });

  it('sends the user to the detail screen when the sizes cannot be loaded', async () => {
    getProductDetailBySlugMock.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useShowcaseQuickAdd(), { wrapper });

    act(() => result.current.open(showcaseProduct));

    await waitFor(() => expect(result.current.isOpen).toBe(false));
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('ignores a late response after the sheet was closed', async () => {
    let resolveDetail: (value: unknown) => void = () => undefined;
    getProductDetailBySlugMock.mockReturnValue(
      new Promise((resolve) => {
        resolveDetail = resolve;
      }) as never,
    );
    const { result } = renderHook(() => useShowcaseQuickAdd(), { wrapper });

    act(() => result.current.open(showcaseProduct));
    act(() => result.current.close());
    await act(async () => resolveDetail(makeDetail({ isBundle: true })));

    expect(result.current.isOpen).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not add anything without a resolvable size', async () => {
    getProductDetailBySlugMock.mockResolvedValue(makeDetail() as never);
    const { result } = renderHook(() => useShowcaseQuickAdd(), { wrapper });

    act(() => result.current.open(showcaseProduct));
    await waitFor(() => expect(result.current.detail).toBeTruthy());
    act(() => result.current.confirm());

    expect(mockAddToCart).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('Hata', 'Bu ürün için beden bilgisi bulunamadı, sepete eklenemedi.');
  });
});
