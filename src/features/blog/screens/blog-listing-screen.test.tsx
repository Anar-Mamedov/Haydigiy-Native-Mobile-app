import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { getBlogCategoriesDto, getBlogPostsDto } from '@/services/blog.service';
import { BlogListingScreen } from './blog-listing-screen';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, canGoBack: () => true, push: mockPush, replace: mockReplace }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

jest.mock('@/services/blog.service', () => ({
  getBlogCategoriesDto: jest.fn(),
  getBlogPostsDto: jest.fn(),
}));

const mockGetPosts = getBlogPostsDto as jest.Mock;
const mockGetCategories = getBlogCategoriesDto as jest.Mock;

const postDto = (id: number, overrides: Record<string, unknown> = {}) => ({
  id: String(id),
  slug: `yazi-${id}`,
  title: `Yazı ${id}`,
  excerpt: `Özet ${id}`,
  category: { id: 3, title: 'Kombin', slug: 'kombin' },
  publishedAt: '2026-10-01T12:00:00+03:00',
  ...overrides,
});

describe('BlogListingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCategories.mockResolvedValue([
      { id: 3, title: 'Kombin', slug: 'kombin' },
      { id: 8, title: 'Kazak/Triko', slug: 'kazak' },
    ]);
    mockGetPosts.mockResolvedValue({
      data: [postDto(1), postDto(2, { is_pinned: true }), postDto(3)],
      pagination: { current_page: 1, last_page: 1, total: 3 },
    });
  });

  it.each(['light', 'dark'] as const)('renders the hero, category tabs and posts in %s theme', async (theme) => {
    renderWithTamagui(<BlogListingScreen />, theme);

    expect(await screen.findByTestId('blog-featured-yazi-2')).toBeTruthy();
    expect(screen.getByText('Stil · İlham · HaydiGiy')).toBeTruthy();
    expect(screen.getAllByText('Blog').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Tümü')).toBeTruthy();
    expect(screen.getByLabelText('Kazak/Triko')).toBeTruthy();
    expect(screen.getByTestId('blog-compact-yazi-1')).toBeTruthy();
    expect(screen.getByTestId('blog-compact-yazi-3')).toBeTruthy();
    expect(mockGetPosts).toHaveBeenCalledWith({ page: 1, categorySlug: null });
  });

  it('filters by the selected category tab without opening a new screen', async () => {
    renderWithTamagui(<BlogListingScreen />);
    await screen.findByTestId('blog-featured-yazi-2');

    mockGetPosts.mockResolvedValueOnce({ data: [postDto(9, { title: 'Kazak yazısı' })] });
    fireEvent.press(screen.getByLabelText('Kazak/Triko'));

    expect(await screen.findByText('Kazak yazısı')).toBeTruthy();
    expect(mockGetPosts).toHaveBeenLastCalledWith({ page: 1, categorySlug: 'kazak' });
    expect(screen.getByLabelText('Kazak/Triko').props.accessibilityState).toEqual({ selected: true });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('maps a web category slug to the API slug and shows the category title', async () => {
    renderWithTamagui(<BlogListingScreen initialCategory="kazak-triko" />);

    await waitFor(() => expect(mockGetPosts).toHaveBeenCalledWith({ page: 1, categorySlug: 'kazak' }));
    expect(mockGetPosts).not.toHaveBeenCalledWith(expect.objectContaining({ categorySlug: 'kazak-triko' }));
    expect(await screen.findAllByText('Kazak/Triko')).toHaveLength(2);
  });

  it('opens the article when a post is pressed', async () => {
    renderWithTamagui(<BlogListingScreen />);

    fireEvent.press(await screen.findByTestId('blog-compact-yazi-1'));

    expect(mockPush).toHaveBeenCalledWith({ pathname: '/blog/[slug]', params: { slug: 'yazi-1' } });
  });

  it('shows the web empty message when there are no posts', async () => {
    mockGetPosts.mockResolvedValue({ data: [] });
    renderWithTamagui(<BlogListingScreen />);

    expect(await screen.findByText('Henüz yayınlanmış bir yazı yok.')).toBeTruthy();
  });

  it('shows an error with retry when posts fail to load', async () => {
    mockGetPosts.mockRejectedValueOnce(new Error('network'));
    renderWithTamagui(<BlogListingScreen />);

    expect(await screen.findByText('Bir Hata Oluştu')).toBeTruthy();
    fireEvent.press(screen.getByText('Tekrar Dene'));

    expect(await screen.findByTestId('blog-featured-yazi-2')).toBeTruthy();
  });
});
