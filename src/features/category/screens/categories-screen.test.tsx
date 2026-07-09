import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { CategoriesScreen } from './categories-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useMenuGroupsQuery, useMenuItemsQuery } from '../api/category.queries';

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
  router: {
    get push() { return mockPush; },
    get replace() { return mockReplace; },
    get back() { return mockBack; },
    get canGoBack() { return mockCanGoBack; },
  },
}));

jest.mock('../api/category.queries', () => ({
  useMenuGroupsQuery: jest.fn(),
  useMenuItemsQuery: jest.fn(),
  useCategoryFirstProductImageQuery: jest.fn().mockReturnValue({ data: { image: 'test.jpg' }, isPending: false }),
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

const mockGroups = [
  { id: 1, name: 'Mobil Menü', location: 'mobile' },
  { id: 2, name: 'Header Menü', location: 'header' },
];

const mockMenuItems = [
  {
    id: 101,
    title: 'Kadın',
    category_id: 10,
    url: 'kategori/kadin',
    children: [
      {
        id: 201,
        title: 'Giyim',
        category_id: 20,
        url: 'kategori/giyim',
        children: [
          { id: 301, title: 'Elbise', category_id: 30, url: 'kategori/elbise' },
          { id: 302, title: 'T-shirt', category_id: 31, url: 'kategori/t-shirt' },
        ],
      },
      {
        id: 202,
        title: 'Ayakkabı',
        category_id: 21,
        url: 'kategori/ayakkabi',
        children: [],
      },
    ],
  },
  {
    id: 102,
    title: 'Erkek',
    category_id: 11,
    url: 'kategori/erkek',
    children: [
      {
        id: 203,
        title: 'Giyim Erkek',
        category_id: 22,
        url: 'kategori/erkek-giyim',
        children: [
          { id: 303, title: 'Pantolon', category_id: 33, url: 'kategori/erkek-pantolon' },
        ],
      },
    ],
  },
];

describe('CategoriesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useMenuGroupsQuery as jest.Mock).mockReturnValue({
      data: mockGroups,
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    (useMenuItemsQuery as jest.Mock).mockReturnValue({
      data: mockMenuItems,
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('renders loading spinner when queries are pending', () => {
    (useMenuGroupsQuery as jest.Mock).mockReturnValue({
      isPending: true,
    });
    (useMenuItemsQuery as jest.Mock).mockReturnValue({
      isPending: true,
    });

    renderWithTamagui(<CategoriesScreen />);
    expect(screen.getByText('Kategoriler yükleniyor...')).toBeTruthy();
  });

  it('renders error state when queries fail', () => {
    const refetchGroups = jest.fn();
    (useMenuGroupsQuery as jest.Mock).mockReturnValue({
      isError: true,
      refetch: refetchGroups,
    });

    renderWithTamagui(<CategoriesScreen />);
    expect(screen.getByText('Kategoriler Yüklenemedi')).toBeTruthy();

    const retryButton = screen.getByText('Tekrar Dene');
    fireEvent.press(retryButton);
    expect(refetchGroups).toHaveBeenCalled();
  });

  it('renders category list items correctly in successful state', () => {
    renderWithTamagui(<CategoriesScreen />);

    // Horizontal Tabs (main categories)
    expect(screen.getByText('Kadın')).toBeTruthy();
    expect(screen.getByText('Erkek')).toBeTruthy();

    // Sidebar Items (subcategories) for the selected 'Kadın'
    expect(screen.getByText('Giyim')).toBeTruthy();
    expect(screen.getByText('Ayakkabı')).toBeTruthy();

    // Grid Items (sub-subcategories) under 'Giyim' (default active subcategory)
    expect(screen.getByText('Elbise')).toBeTruthy();
    expect(screen.getByText('T-shirt')).toBeTruthy();

    // View All Products button
    expect(screen.getByText('Giyim Tüm Ürünler')).toBeTruthy();
  });

  it('keeps the view-all button label centered inside the button', () => {
    renderWithTamagui(<CategoriesScreen />);

    const labelStyle = StyleSheet.flatten(screen.getByText('Giyim Tüm Ürünler').props.style);

    expect(labelStyle).toEqual(
      expect.objectContaining({
        lineHeight: 18,
        textAlign: 'center',
      }),
    );
  });

  it('switches subcategories when sidebar item is pressed', () => {
    renderWithTamagui(<CategoriesScreen />);

    // Initially 'Giyim' is active, showing 'Elbise' and 'T-shirt'
    expect(screen.getByText('Elbise')).toBeTruthy();

    // Press 'Ayakkabı' (index 1)
    fireEvent.press(screen.getByText('Ayakkabı'));

    // Now 'Ayakkabı' is active, and it has no children, so 'Elbise' shouldn't render
    expect(screen.queryByText('Elbise')).toBeNull();
    expect(screen.getByText('Ayakkabı Tüm Ürünler')).toBeTruthy();
  });

  it('switches main categories when horizontal tab is pressed', () => {
    renderWithTamagui(<CategoriesScreen />);

    // Press 'Erkek' horizontal tab
    fireEvent.press(screen.getByText('Erkek'));

    // Sidebar items should update to Erkek subcategories
    expect(screen.getByText('Giyim Erkek')).toBeTruthy();
    expect(screen.queryByText('Giyim')).toBeNull(); // Kadın subcategory should be gone
  });

  it('navigates when View All button is pressed', () => {
    renderWithTamagui(<CategoriesScreen />);

    fireEvent.press(screen.getByText('Giyim Tüm Ürünler'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/kategori/giyim',
      params: { c: '20', q: '' },
    });
  });

  it('navigates when a category grid card is pressed', () => {
    renderWithTamagui(<CategoriesScreen />);

    fireEvent.press(screen.getByText('Elbise'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/kategori/elbise',
      params: { c: '30', q: '' },
    });
  });

  it('filters subcategories when typing in search input', () => {
    renderWithTamagui(<CategoriesScreen />);

    const searchInput = screen.getByPlaceholderText('Ürün veya kategori ara');
    fireEvent.changeText(searchInput, 'shirt');

    // Should match T-shirt, but not Elbise
    expect(screen.getByText('T-shirt')).toBeTruthy();
    expect(screen.queryByText('Elbise')).toBeNull();
  });

  it('displays empty search results message when no matches are found', () => {
    renderWithTamagui(<CategoriesScreen />);

    const searchInput = screen.getByPlaceholderText('Ürün veya kategori ara');
    fireEvent.changeText(searchInput, 'nonexistent');

    expect(screen.getByText('"nonexistent" için sonuç bulunamadı.')).toBeTruthy();
  });
});
