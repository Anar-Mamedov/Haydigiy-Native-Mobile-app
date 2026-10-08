import { Linking } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { getBlogPostDto } from '@/services/blog.service';
import { BlogArticleScreen } from './blog-article-screen';

const mockPush = jest.fn();
const mockDismissTo = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: () => true,
    dismissTo: mockDismissTo,
    push: mockPush,
    replace: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

jest.mock('@/services/blog.service', () => ({
  getBlogPostDto: jest.fn(),
}));

// Web → app yol eşlemesi ortak derin bağlantı modülünün işi; burada yalnızca yönlendirme test edilir.
jest.mock('@/utils/resolve-deep-link', () => ({
  resolveDeepLinkPath: (input: string) => input.replace('https://haydigiy.com', ''),
}));

const mockGetPost = getBlogPostDto as jest.Mock;

const article = {
  id: '25',
  slug: 'cizme-rehberi',
  title: 'Körüklü Çizme Rehberi',
  excerpt: 'Kış kombinlerinin yıldızı.',
  content:
    '<h1>Körüklü Çizme Rehberi</h1><p>Detaylar için <a href="https://haydigiy.com/blog/kis-trendleri">kış trendleri</a> ' +
    've <a href="https://instagram.com/haydigiy">Instagram</a>.</p><h2>Bakım</h2><ul><li>Fırçalayın</li></ul>',
  answer_summary: 'Körüklü çizme kışın hem sıcak tutar hem şık durur.',
  cover_image: 'https://cdn.haydigiy.com/cizme.webp',
  category: { id: 3, title: 'Kombin', slug: 'kombin' },
  tags: ['Çizme'],
  faqs: [{ question: 'Rahat mı?', answer: 'Gün boyu rahattır.' }],
  relatedProducts: [
    {
      id: 100098,
      name: 'Körüklü Çizme Siyah',
      price: '849,99 TL',
      url: 'https://haydigiy.com/koruklu-cizme-siyah-100098',
      image: 'https://cdn.haydigiy.com/c1.webp',
    },
  ],
};

describe('BlogArticleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPost.mockResolvedValue(article);
  });

  it.each(['light', 'dark'] as const)('renders the article sections in %s theme', async (theme) => {
    renderWithTamagui(<BlogArticleScreen slug="cizme-rehberi" />, theme);

    expect(await screen.findByText('Körüklü Çizme Rehberi')).toBeTruthy();
    expect(mockGetPost).toHaveBeenCalledWith('cizme-rehberi');
    expect(screen.getByText('Kısa Cevap')).toBeTruthy();
    expect(screen.getByText('Körüklü çizme kışın hem sıcak tutar hem şık durur.')).toBeTruthy();
    expect(screen.getByText('Yazıdaki ürünler')).toBeTruthy();
    expect(screen.getByText('849,99 TL')).toBeTruthy();
    expect(screen.getByText('Bakım')).toBeTruthy();
    expect(screen.getByText('Fırçalayın')).toBeTruthy();
    expect(screen.getByText('Çizme')).toBeTruthy();
    expect(screen.getByText('Sık Sorulan Sorular')).toBeTruthy();
    // İçerikteki başlık tekrarı atlandığı için başlık tek kez görünür.
    expect(screen.getAllByText('Körüklü Çizme Rehberi')).toHaveLength(1);
  });

  it('opens the product detail from the product strip', async () => {
    renderWithTamagui(<BlogArticleScreen slug="cizme-rehberi" />);

    fireEvent.press(await screen.findByTestId('blog-product-koruklu-cizme-siyah-100098'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/product/[id]',
      params: expect.objectContaining({ id: 'koruklu-cizme-siyah-100098', price: '849.99', title: 'Körüklü Çizme Siyah' }),
    });
  });

  it('keeps haydigiy blog links in the app and opens other links externally', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    renderWithTamagui(<BlogArticleScreen slug="cizme-rehberi" />);

    fireEvent.press(await screen.findByText('kış trendleri'));
    expect(mockPush).toHaveBeenCalledWith('/blog/kis-trendleri');

    fireEvent.press(screen.getByText('Instagram'));
    expect(openURL).toHaveBeenCalledWith('https://instagram.com/haydigiy');
    openURL.mockRestore();
  });

  it('navigates through the breadcrumb and toggles FAQ answers', async () => {
    renderWithTamagui(<BlogArticleScreen slug="cizme-rehberi" />);

    fireEvent.press(await screen.findByLabelText('Kombin'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/blog/kategori/[category]', params: { category: 'kombin' } });

    fireEvent.press(screen.getAllByLabelText('Blog')[0]);
    expect(mockDismissTo).toHaveBeenCalledWith('/blog');

    expect(screen.queryByText('Gün boyu rahattır.')).toBeNull();
    fireEvent.press(screen.getByLabelText('Rahat mı?'));
    expect(screen.getByText('Gün boyu rahattır.')).toBeTruthy();
  });

  it('shows a not-found state that leads back to the blog', async () => {
    mockGetPost.mockResolvedValue(null);
    renderWithTamagui(<BlogArticleScreen slug="yok" />);

    expect(await screen.findByText('Blog yazısı bulunamadı')).toBeTruthy();
    fireEvent.press(screen.getByText("Blog'a Dön"));
    expect(mockDismissTo).toHaveBeenCalledWith('/blog');
  });

  it('shows an error state with retry', async () => {
    mockGetPost.mockRejectedValueOnce(new Error('network'));
    renderWithTamagui(<BlogArticleScreen slug="cizme-rehberi" />);

    expect(await screen.findByText('Bir Hata Oluştu')).toBeTruthy();
    fireEvent.press(screen.getByText('Tekrar Dene'));
    expect(await screen.findByText('Kısa Cevap')).toBeTruthy();
  });
});
