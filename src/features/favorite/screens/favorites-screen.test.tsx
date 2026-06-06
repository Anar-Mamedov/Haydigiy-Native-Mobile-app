import { screen } from '@testing-library/react-native';
import { FavoritesScreen } from './favorites-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useFavoritesQuery } from '@/features/favorite/api/favorite.queries';
import { getAccessToken } from '@/lib/storage/secure-storage';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    canGoBack: mockCanGoBack,
  }),
  useFocusEffect: (cb: any) => cb(),
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

jest.mock('@/lib/env', () => ({
  appEnv: {
    apiBaseUrl: 'https://api.example.com',
  },
}));

jest.mock('@/lib/storage/secure-storage', () => ({
  getAccessToken: jest.fn().mockResolvedValue('mock-token'),
}));

jest.mock('@/features/favorite/api/favorite.queries', () => ({
  useFavoritesQuery: jest.fn(),
  useRemoveFavoriteMutation: () => ({
    mutateAsync: jest.fn(),
  }),
}));

const mockFavorites = [
  {
    productId: '1',
    totalFavorites: 10,
    product: {
      id: '1',
      title: 'Elbise 1',
      slug: 'elbise-1',
      price: 150,
      currency: 'TRY',
      imageUrl: 'https://example.com/e1.png',
      brand: 'Brand A',
      rating: 4.5,
      reviewCount: 20,
      shippingLabel: '',
      category: 'Elbise',
      hasStock: true,
      variants: [
        { id: '101', name: 'S', hasStock: true, price: 150 },
        { id: '102', name: 'M', hasStock: true, price: 150 },
      ],
    },
  },
  {
    productId: '2',
    totalFavorites: 15,
    product: {
      id: '2',
      title: 'T-shirt 2',
      slug: 't-shirt-2',
      price: 100,
      currency: 'TRY',
      imageUrl: 'https://example.com/e2.png',
      brand: 'Brand B',
      rating: 4.0,
      reviewCount: 5,
      shippingLabel: '',
      category: 'T-shirt',
      hasStock: false,
      variants: [],
    },
  },
];

describe('FavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFavoritesQuery as jest.Mock).mockReturnValue({
      data: mockFavorites,
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('renders favorites list correctly on successful load', async () => {
    (getAccessToken as jest.Mock).mockResolvedValue('mock-token');

    renderWithTamagui(<FavoritesScreen />);

    expect(await screen.findByText('Favorilerim')).toBeTruthy();
    expect(screen.getByText('Elbise 1')).toBeTruthy();
    expect(screen.getByText('T-shirt 2')).toBeTruthy();
  });

  it('renders unauthenticated state when token is missing', async () => {
    (getAccessToken as jest.Mock).mockResolvedValue(null);

    renderWithTamagui(<FavoritesScreen />);

    const authTitle = await screen.findByText('Favorilerim İçin Giriş Yapın');
    expect(authTitle).toBeTruthy();
  });

  it('renders search input field', async () => {
    (getAccessToken as jest.Mock).mockResolvedValue('mock-token');

    renderWithTamagui(<FavoritesScreen />);

    const searchInput = await screen.findByPlaceholderText('Favorilerimde ara...');
    expect(searchInput).toBeTruthy();
  });
});
