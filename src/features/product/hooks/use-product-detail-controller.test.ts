import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useProductDetailController } from './use-product-detail-controller';
import { useProductDetailsQuery } from '@/features/product/api/product.queries';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
let mockCanGoBack = true;
const mockAddToCart = jest.fn();
const mockAddBundleToCart = jest.fn();
const mockGoToCartAfterAdd = jest.fn();
let mockParams: Record<string, string> = { id: 'deneme-urun' };

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({
    back: mockBack,
    canGoBack: () => mockCanGoBack,
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock('@/features/product/api/product.queries', () => ({
  useProductDetailsQuery: jest.fn(),
}));

jest.mock('@/features/cart/api/cart.queries', () => ({
  useAddToCartMutation: () => ({ mutate: mockAddToCart, isPending: false }),
  useAddBundleToCartMutation: () => ({ mutate: mockAddBundleToCart, isPending: false }),
}));

jest.mock('@/features/cart/hooks/use-go-to-cart-after-add', () => ({
  useGoToCartAfterAdd: () => mockGoToCartAfterAdd,
}));

jest.mock('@/features/shipping/api/shipping.queries', () => ({
  useShippingEstimateQuery: () => ({ data: { message: 'Yarın kargoda' } }),
}));

jest.mock('@/features/favorite/api/favorite.queries', () => ({
  useToggleFavorite: () => ({ isFavorite: false, toggleFavorite: jest.fn() }),
}));

jest.mock('@/features/insider/hooks/use-insider-page-tracking', () => ({
  useTrackProductDetailView: jest.fn(),
}));

jest.mock('@/utils/recently-viewed', () => ({
  trackViewedProduct: jest.fn(),
}));

jest.mock('./use-notify-stock', () => ({
  useNotifyStock: () => ({
    closeConfirmation: jest.fn(),
    isConfirmationOpen: false,
    isNotifying: false,
    isVariantNotified: () => false,
    requestNotification: jest.fn(async () => undefined),
  }),
}));

const useProductDetailsQueryMock = useProductDetailsQuery as jest.MockedFunction<
  typeof useProductDetailsQuery
>;

const SIZE_M = { id: '101', name: 'M', quantity: 5, price: 309.99, hasStock: true, pivotId: '4321' };
const SIZE_L = { id: '102', name: 'L', quantity: 0, price: 309.99, hasStock: false };

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: '95236',
    title: 'Uzun Kollu Cepli Gömlek Siyah - 31678.264.',
    slug: 'uzun-kollu-cepli-gomlek-siyah',
    price: 309.99,
    imageUrl: 'https://cdn/gomlek.webp',
    brand: 'HaydiGiy',
    sellerName: 'HaydiGiy',
    currency: 'TRY',
    description: '',
    rating: 0,
    reviewCount: 0,
    category: 'Gömlek',
    variants: [SIZE_M, SIZE_L],
    ...overrides,
  };
}

/** Paketin kendi varyantı yoktur; bedenler paketteki her ürün için ayrı seçilir. */
function makeBundleProduct() {
  return makeProduct({
    id: '97045',
    title: 'Deneme bundle',
    slug: 'deneme-bundle',
    variants: [],
    isBundle: true,
    bundleItems: [
      {
        bundleItemId: 12,
        productId: 525212,
        title: 'Kemer Detaylı Elbise',
        slug: null,
        imageUrl: '',
        price: 1250,
        oldPrice: null,
        quantity: 1,
        isAvailable: true,
        variants: [
          { key: '3510-0', variantId: '3510', name: 'S', name2: null, stock: 4, hasStock: true },
        ],
      },
    ],
    bundleSummary: {
      itemCount: 1,
      itemsTotal: 2500,
      bundlePrice: 2000,
      savings: 500,
      savingsPercent: 20,
      isSellable: true,
      maxQuantity: 10,
    },
  });
}

function setup(
  queryState: Record<string, unknown> = {},
  params: Record<string, string> = { id: 'deneme-urun' },
) {
  mockParams = params;
  useProductDetailsQueryMock.mockReturnValue({
    data: makeProduct(),
    error: undefined,
    isError: false,
    isPending: false,
    refetch: jest.fn(),
    ...queryState,
  } as never);

  return renderHook(() => useProductDetailController());
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCanGoBack = true;
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

describe('useProductDetailController — sepete ekleme', () => {
  it('adds the selected size and takes the shopper to the cart', () => {
    const { result } = setup();

    act(() => result.current.setSelectedVariant(SIZE_M as never));
    act(() => result.current.handleAddToCart());

    // Sepet ucu bedenin pivot id'sini bekler.
    expect(mockAddToCart.mock.calls[0][0]).toEqual(
      expect.objectContaining({ variantId: '4321' }),
    );
    expect(result.current.showSizeSheet).toBe(false);
    expect(mockGoToCartAfterAdd).toHaveBeenCalledTimes(1);
  });

  it('opens the size sheet instead of adding when no size is chosen', () => {
    const { result } = setup();

    act(() => result.current.handleAddToCart());

    expect(result.current.showSizeSheet).toBe(true);
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  // Regresyon: beden id'si çözülemediğinde ekran hiçbir şey eklemeden sepete
  // yönlendiriyor ve kullanıcı sessizce boş sepetle kalıyordu.
  it('never sends the shopper to the cart when no variant id can be resolved', () => {
    const { result } = setup({ data: makeProduct({ variants: [] }) });

    act(() => result.current.handleAddToCart());

    expect(mockAddToCart).not.toHaveBeenCalled();
    expect(mockGoToCartAfterAdd).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Hata',
      'Bu ürün için beden bilgisi bulunamadı, sepete eklenemedi.',
    );
  });

  // Regresyon: istek başarısız olduğunda hiçbir geri bildirim verilmiyordu.
  it('surfaces the backend message when the request fails', () => {
    const { result } = setup();

    act(() => result.current.setSelectedVariant(SIZE_M as never));
    act(() => result.current.handleAddToCart());
    act(() =>
      mockAddToCart.mock.calls[0][1].onError({
        isAxiosError: true,
        response: { status: 400, data: { message: 'Stokta yok.' } },
      }),
    );

    expect(Alert.alert).toHaveBeenCalledWith('Hata', 'Stokta yok.');
  });

  it('falls back to a readable message when the backend sends none', () => {
    const { result } = setup();

    act(() => result.current.setSelectedVariant(SIZE_M as never));
    act(() => result.current.handleAddToCart());
    act(() => mockAddToCart.mock.calls[0][1].onError(new Error('Network Error')));

    // Teknik hata metni değil, kullanıcıya yazılmış Türkçe mesaj gösterilir.
    expect(Alert.alert).toHaveBeenCalledWith(
      'Hata',
      'Ürün sepete eklenemedi. Lütfen tekrar deneyin.',
    );
  });
});

describe('useProductDetailController — paket ürün', () => {
  it('opens the package sheet instead of the size sheet', () => {
    const { result } = setup({ data: makeBundleProduct() });

    act(() => result.current.handleAddToCart());

    expect(result.current.bundle.isSheetOpen).toBe(true);
    expect(result.current.showSizeSheet).toBe(false);
    // Paket tek varyantla sepete eklenemez.
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it('exposes the package items and summary to the screen', () => {
    const { result } = setup({ data: makeBundleProduct() });

    expect(result.current.bundle.isBundle).toBe(true);
    expect(result.current.bundle.items).toHaveLength(1);
    expect(result.current.bundle.summary?.bundlePrice).toBe(2000);
  });

  it('treats a normal product as a non-package', () => {
    const { result } = setup();

    expect(result.current.bundle.isBundle).toBe(false);
    expect(result.current.bundle.summary).toBeNull();
  });
});

describe('useProductDetailController — beden durumu', () => {
  it('flags a sold-out size so the footer can offer a stock notification', () => {
    const { result } = setup();

    expect(result.current.isSelectedVariantOutOfStock).toBe(false);

    act(() => result.current.setSelectedVariant(SIZE_L as never));

    expect(result.current.isSelectedVariantOutOfStock).toBe(true);
  });

  it('applies the size the calculator recommends, ignoring letter case', () => {
    const { result } = setup();

    act(() => result.current.applyCalculatedSize('m'));

    expect(result.current.selectedVariant?.id).toBe('101');
  });

  it('keeps the current selection when the recommended size does not exist', () => {
    const { result } = setup();

    act(() => result.current.applyCalculatedSize('XXL'));

    expect(result.current.selectedVariant).toBeNull();
  });
});

describe('useProductDetailController — türetilen görünüm verisi', () => {
  it('renders the list-card preview while the detail request is still running', () => {
    const { result } = setup(
      { data: undefined, isPending: true },
      { id: '95236', title: 'Önizleme Ürünü', price: '149.9', imageUrl: 'https://cdn/p.webp' },
    );

    expect(result.current.displayData?.title).toBe('Önizleme Ürünü');
    expect(result.current.displayData?.price).toBe(149.9);
    expect(result.current.areProductOptionsLoading).toBe(true);
  });

  it('has nothing to display when neither the response nor preview params exist', () => {
    const { result } = setup({ data: undefined, isPending: true });

    expect(result.current.displayData).toBeNull();
    expect(result.current.productCode).toBe('');
    expect(result.current.productImages).toEqual([]);
  });

  it('falls back to the cover image when the product has no gallery', () => {
    const { result } = setup();

    expect(result.current.productImages).toEqual(['https://cdn/gomlek.webp']);
  });

  it('prefers the gallery images when they exist', () => {
    const images = ['https://cdn/1.webp', 'https://cdn/2.webp'];
    const { result } = setup({ data: makeProduct({ images }) });

    expect(result.current.productImages).toEqual(images);
  });

  it('reads the product code from the title for the pinned badge', () => {
    const { result } = setup();

    expect(result.current.productCode).toBe('31678.264.');
  });

  it('passes the shipping estimate through to the screen', () => {
    const { result } = setup();

    expect(result.current.shippingMessage).toBe('Yarın kargoda');
    expect(result.current.shippingEstimate).toEqual({ message: 'Yarın kargoda' });
  });
});

describe('useProductDetailController — yönlendirme', () => {
  it('opens the reviews and questions screens for the loaded product', () => {
    const { result } = setup();

    act(() => result.current.openReviews());
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(tabs)/product-reviews',
      params: { slug: 'uzun-kollu-cepli-gomlek-siyah' },
    });

    act(() => result.current.openQuestions());
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(tabs)/product-questions',
      params: { slug: 'uzun-kollu-cepli-gomlek-siyah' },
    });
  });

  it('replaces the screen with a preview when another colour is picked', () => {
    const { result } = setup();

    act(() =>
      result.current.handleColorSelect({
        id: '95237',
        name: 'Beyaz Gömlek',
        slug: 'beyaz-gomlek',
        imageUrl: 'https://cdn/beyaz.webp',
        price: 0,
      } as never),
    );

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace.mock.calls[0][0].params).toEqual(
      expect.objectContaining({
        id: 'beyaz-gomlek',
        title: 'Beyaz Gömlek',
        // Fiyat gelmediğinde kardeş renk mevcut ürünün fiyatını devralır.
        price: '309.99',
      }),
    );
  });

  it('goes back when the content is pulled down and there is history', () => {
    const { result } = setup();

    act(() => result.current.handlePullDismiss());

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('falls back to home when the detail was opened directly by a deep link', () => {
    mockCanGoBack = false;
    const { result } = setup();

    act(() => result.current.handlePullDismiss());

    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(mockBack).not.toHaveBeenCalled();
  });
});
