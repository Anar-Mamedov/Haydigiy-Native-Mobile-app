import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { InfoDocumentScreen } from './info-document-screen';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);
const mockRedirect = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
  useRouter: () => ({
    back: mockBack,
    canGoBack: mockCanGoBack,
    push: mockPush,
    replace: mockReplace,
  }),
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

describe('InfoDocumentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanGoBack.mockReturnValue(true);
  });

  it.each(['light', 'dark'] as const)('renders the about page title and text in the %s theme', (theme) => {
    renderWithTamagui(<InfoDocumentScreen slug="hakkimizda" />, theme);

    expect(screen.getByText('Hakkımızda')).toBeTruthy();
    expect(screen.getByText(/binlerce ürünümüzle/)).toBeTruthy();
  });

  it.each([
    ['islem-rehberi', 'İşlem Rehberi', /I\. Teknik Adımlar/],
    ['iptal-iade-kosullari', 'Cayma, İptal ve İade Koşulları', /Cayma hakkı aşağıdaki hallerde kullanılamaz/],
    ['uyelik-sozlesmesi', 'Üyelik Sözleşmesi', /Üyelik için reşit olmak gerekmektedir/],
    ['kullanim-kosullari', 'Kullanım Koşulları', /İşbu kullanıcı koşulları/],
  ])('renders the %s document', (slug, title, text) => {
    renderWithTamagui(<InfoDocumentScreen slug={slug} />);

    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getAllByText(text).length).toBeGreaterThan(0);
  });

  it('opens an in-text link on the app route of the referenced page', () => {
    renderWithTamagui(<InfoDocumentScreen slug="islem-rehberi" />);

    fireEvent.press(screen.getByRole('link', { name: 'Kişisel Verilerin Korunması' }));

    expect(mockPush).toHaveBeenCalledWith('/bilgi/kisisel-verilerin-korunmasi');
  });

  it('redirects an unknown page to the 404 screen', () => {
    renderWithTamagui(<InfoDocumentScreen slug="kariyer" />);

    expect(mockRedirect).toHaveBeenCalledWith('/not-found');
  });

  it('goes back, or home when opened directly from a link', () => {
    renderWithTamagui(<InfoDocumentScreen slug="hakkimizda" />);

    fireEvent.press(screen.getByLabelText('Geri dön'));
    expect(mockBack).toHaveBeenCalled();

    mockCanGoBack.mockReturnValue(false);
    fireEvent.press(screen.getByLabelText('Geri dön'));
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
