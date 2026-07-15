import { fireEvent, screen } from '@testing-library/react-native';
import { ProductListScreen } from './product-list-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useInfiniteSearchProductsQuery } from '@/features/product/api/product.queries';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);
const mockRedirect = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    canGoBack: mockCanGoBack,
  }),
  router: {
    get push() { return mockPush; },
    get replace() { return mockReplace; },
    get back() { return mockBack; },
    get canGoBack() { return mockCanGoBack; },
  },
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

jest.mock('@/features/product/api/product.queries', () => ({
  useInfiniteSearchProductsQuery: jest.fn(),
}));

jest.mock('@/features/favorite/api/favorite.queries', () => {
  const { useFavoriteStore } = require('@/features/favorite/store/use-favorite-store');
  return {
    useToggleFavorite: (product: any) => {
      const isFavorite = useFavoriteStore((state: any) => state.isFavorite(product?.id ?? ''));
      const toggleFavorite = () => {
        if (isFavorite) {
          useFavoriteStore.getState().removeFavorite(product.id);
        } else {
          useFavoriteStore.getState().addFavorite(product.id);
        }
      };
      return {
        isFavorite,
        toggleFavorite,
        isPending: false,
      };
    },
  };
});

const mockProducts = [
  {
    id: 'product-1',
    title: 'Test Product 1',
    slug: 'test-product-1',
    price: 150,
    originalPrice: 200,
    currency: 'TRY',
    imageUrl: 'https://example.com/p1.png',
    brand: 'Test Brand',
    rating: 4.5,
    reviewCount: 20,
    shippingLabel: 'Fast shipping',
    category: 'Elbise',
    videoPath: 'https://example.com/product-1-video.mp4',
    sizes: [
      { name: 'S', hasStock: true },
      { name: 'M', hasStock: false },
    ],
  },
  {
    id: 'product-2',
    title: 'Test Product 2',
    slug: 'test-product-2',
    price: 300,
    currency: 'TRY',
    imageUrl: 'https://example.com/p2.png',
    brand: 'Another Brand',
    rating: 4.8,
    reviewCount: 35,
    shippingLabel: 'Free shipping',
    category: 'Elbise',
    sizes: [
      { name: 'L', hasStock: true },
    ],
  },
];

const mockCategory = {
  id: 40,
  name: 'Elbise',
  slug: 'elbise',
  description: 'Nice dresses',
  seo_title: 'Elbise Modelleri',
  seo_description: 'Elbise Modelleri ve Fiyatları',
  children: [
    { id: 41, parent_id: 40, name: 'Mini Elbise', slug: 'mini-elbise' },
    { id: 42, parent_id: 40, name: 'Midi Elbise', slug: 'midi-elbise' },
  ],
};

const mockAvailableFilters = {
  productCategories: [
    { id: 100, name: 'KADIN', slug: 'kadin', productCount: 1609, parentId: null },
    { id: 101, name: 'Kadın Alt Giyim', slug: 'kadin-alt-giyim', productCount: 398, parentId: 100 },
  ],
  categoryChildren: [],
  colors: [
    { id: 1, name: 'Kırmızı', hex: '#ff0000', productCount: 5 },
    { id: 2, name: 'Mavi', hex: '#0000ff', productCount: 10 },
  ],
  variants: [
    { id: 10, name: 'S', parentId: 0, productCount: 4 },
    { id: 11, name: 'M', parentId: 0, productCount: 8 },
  ],
  properties: [
    { id: 21, name: 'Var', parentId: 20, parentName: 'Aksesuar', productCount: 3 },
  ],
  priceRanges: [
    { label: '0 - 100 TL', min: 0, max: 100 },
    { label: '100 - 250 TL', min: 100, max: 250 },
  ],
  useProductCategoryFilters: true,
};

describe('ProductListScreen', () => {
  const mockFetchNextPage = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useInfiniteSearchProductsQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            products: mockProducts,
            category: mockCategory,
            availableFilters: mockAvailableFilters,
            pagination: { current_page: 1, last_page: 2, total: 4, per_page: 2 },
          },
        ],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
    });
  });

  it('renders loading state when pending', () => {
    (useInfiniteSearchProductsQuery as jest.Mock).mockReturnValue({
      isPending: true,
    });

    renderWithTamagui(<ProductListScreen slug="elbise" categoryId={40} />);
    expect(screen.getByText('Ürünler yükleniyor...')).toBeTruthy();
  });

  it('renders error state when fetch fails', () => {
    (useInfiniteSearchProductsQuery as jest.Mock).mockReturnValue({
      isError: true,
      refetch: mockRefetch,
    });

    renderWithTamagui(<ProductListScreen slug="elbise" categoryId={40} />);
    expect(screen.getByText('Ürünler Yüklenemedi')).toBeTruthy();

    fireEvent.press(screen.getByText('Tekrar Dene'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('redirects a removed category to the 404 screen', () => {
    (useInfiniteSearchProductsQuery as jest.Mock).mockReturnValue({
      error: { isAxiosError: true, response: { status: 404 } },
      isError: true,
      isPending: false,
    });

    renderWithTamagui(<ProductListScreen slug="kaldirilan-kategori" categoryId={404} />);

    expect(mockRedirect).toHaveBeenCalledWith('/not-found');
    expect(screen.queryByText('Ürünler Yüklenemedi')).toBeNull();
  });

  it('renders product feed correctly on successful load', () => {
    renderWithTamagui(<ProductListScreen slug="elbise" categoryId={40} />);

    // Header title
    expect(screen.getAllByText('Elbise').length).toBeGreaterThan(0);

    // API-driven quick filter shortcuts
    expect(screen.getByText('Kategori')).toBeTruthy();

    // Sorting & Filtering toolbar buttons
    expect(screen.getAllByText('Önerilen Sıralama')[0]).toBeTruthy();
    expect(screen.getAllByText('Filtrele')[0]).toBeTruthy();

    // Product cards inside grid
    expect(screen.getByText('Test Product 1')).toBeTruthy();
    expect(screen.getByText('Test Product 2')).toBeTruthy();
  });

  it('opens sort sheet when sort button is pressed', () => {
    renderWithTamagui(<ProductListScreen slug="elbise" categoryId={40} />);

    fireEvent.press(screen.getAllByText('Önerilen Sıralama')[0]);

    // Check if Sort Sheet elements render
    expect(screen.getByText('Sıralama')).toBeTruthy();
    expect(screen.getByText('Fiyata Göre Azalan')).toBeTruthy();
    expect(screen.getByText('En çok satanlar')).toBeTruthy();
    expect(screen.getByText('En çok favoriye eklenenler')).toBeTruthy();
  });

  it('opens filter sheet when filter button is pressed', () => {
    renderWithTamagui(<ProductListScreen slug="elbise" categoryId={40} />);

    fireEvent.press(screen.getAllByText('Filtrele')[0]);

    // Check if Filter Sheet elements render
    expect(screen.getAllByText('Filtrele').length).toBeGreaterThan(1);
    expect(screen.getByText('Kategoriler')).toBeTruthy();
    expect(screen.getByText('Fiyat Aralığı')).toBeTruthy();
    expect(screen.getAllByText('Renk').length).toBeGreaterThan(1);
    expect(screen.getAllByText('Beden').length).toBeGreaterThan(1);
  });

  it('navigates to product detail screen when product card is pressed', () => {
    renderWithTamagui(<ProductListScreen slug="elbise" categoryId={40} />);

    fireEvent.press(screen.getByText('Test Product 1'));
    // Navigates by slug (skips the id→slug round-trip) and passes preview
    // params so the detail screen renders immediately.
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/product/[id]',
        params: expect.objectContaining({ id: 'test-product-1', title: 'Test Product 1' }),
      }),
    );
  });

  it('opens product video inside a modal from the product card video button', () => {
    renderWithTamagui(<ProductListScreen slug="elbise" categoryId={40} />);

    fireEvent.press(screen.getByLabelText('Test Product 1 videosunu aç'));

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByTestId('product-video-modal')).toBeTruthy();
    expect(screen.getByTestId('product-carousel-video')).toBeTruthy();
  });

  it('selects multiple categories (parent and child) without hiding the others', () => {
    renderWithTamagui(<ProductListScreen slug="elbise" categoryId={40} />);

    fireEvent.press(screen.getByText('Kategori'));

    // Both a parent and its child are selectable checkboxes
    expect(screen.getByLabelText('KADIN kategori filtresi')).toBeTruthy();
    expect(screen.getByLabelText('Kadın Alt Giyim kategori filtresi')).toBeTruthy();

    // Selecting a parent toggles selection (does not collapse/hide its children)
    fireEvent.press(screen.getByLabelText('KADIN kategori filtresi'));
    expect(screen.getByLabelText('KADIN kategori filtresi').props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText('Kadın Alt Giyim kategori filtresi')).toBeTruthy();

    // A second category can also be selected at the same time (multi-select)
    fireEvent.press(screen.getByLabelText('Kadın Alt Giyim kategori filtresi'));
    expect(screen.getByLabelText('KADIN kategori filtresi').props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText('Kadın Alt Giyim kategori filtresi').props.accessibilityState.checked).toBe(true);
  });

  it('expands filter sections inside the filter sheet', () => {
    renderWithTamagui(<ProductListScreen slug="elbise" categoryId={40} />);

    fireEvent.press(screen.getAllByText('Filtrele')[0]);
    fireEvent.press(screen.getByLabelText('Beden filtresini aç'));

    expect(screen.getByPlaceholderText('Beden Ara')).toBeTruthy();
    expect(screen.getAllByText('S').length).toBeGreaterThan(0);
  });

  it('opens filter sheet at specific section when quick-filter pills are pressed', () => {
    renderWithTamagui(<ProductListScreen slug="elbise" categoryId={40} />);

    // Press Renk pill
    fireEvent.press(screen.getAllByText('Renk')[0]);
    expect(screen.getByPlaceholderText('Renk Ara')).toBeTruthy();
    expect(screen.getByText('Kırmızı')).toBeTruthy();
  });

  it('renders price options from API-provided price ranges', () => {
    renderWithTamagui(<ProductListScreen slug="elbise" categoryId={40} />);

    fireEvent.press(screen.getByText('Fiyat'));

    expect(screen.getByPlaceholderText('Fiyat Ara')).toBeTruthy();
    expect(screen.getByText('0 - 100 TL')).toBeTruthy();
    expect(screen.getByText('100 - 250 TL')).toBeTruthy();
  });
});
