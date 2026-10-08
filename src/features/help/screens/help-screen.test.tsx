import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useHelpQuery } from '../api/help.queries';
import { HelpScreen } from './help-screen';

const mockPush = jest.fn();
let mockParams: Record<string, string | undefined> = {};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: () => true,
    push: mockPush,
    replace: jest.fn(),
  }),
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

jest.mock('../api/help.queries', () => ({
  useHelpQuery: jest.fn(),
}));

jest.mock('../components/help-feedback-button', () => ({
  HelpFeedbackButton: () => null,
}));

const CATEGORIES = [
  {
    id: 1,
    title: 'Siparişlerim',
    slug: 'siparislerim',
    articles: [{ id: 10, question: 'Siparişim nerede?', answer: 'Kargo takibi.' }],
  },
  {
    id: 3,
    title: 'İptal & İade',
    slug: 'iptal-iade',
    articles: [{ id: 30, question: 'Nasıl iade ederim?', answer: 'İade kodu ile.' }],
  },
];

function mockQuery(overrides: Partial<ReturnType<typeof useHelpQuery>>) {
  jest.mocked(useHelpQuery).mockReturnValue({
    data: CATEGORIES,
    isError: false,
    isPending: false,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useHelpQuery>);
}

describe('HelpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
    mockQuery({});
  });

  it('opens the first category by default', () => {
    renderWithTamagui(<HelpScreen />);

    expect(screen.getByText('Siparişim nerede?')).toBeTruthy();
    expect(screen.queryByText('Nasıl iade ederim?')).toBeNull();
  });

  it('opens the category chosen by the web link (?kategori=)', () => {
    mockParams = { kategori: 'iptal-iade' };
    renderWithTamagui(<HelpScreen />);

    expect(screen.getByText('Nasıl iade ederim?')).toBeTruthy();
    expect(screen.queryByText('Siparişim nerede?')).toBeNull();
  });

  it.each(['light', 'dark'] as const)('links the process guides below the FAQ in the %s theme', (theme) => {
    renderWithTamagui(<HelpScreen />, theme);

    expect(screen.getByText('Faydalı Bilgiler')).toBeTruthy();
    fireEvent.press(screen.getByRole('link', { name: 'İşlem Rehberi' }));

    expect(mockPush).toHaveBeenCalledWith('/bilgi/islem-rehberi');
    expect(screen.getByRole('link', { name: 'İptal ve İade Koşulları' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Mağazadan Al' })).toBeTruthy();
  });

  it('shows the error state with a retry action', () => {
    const refetch = jest.fn();
    mockQuery({ data: undefined, isError: true, refetch } as never);
    renderWithTamagui(<HelpScreen />);

    expect(screen.getByText('Bir Hata Oluştu')).toBeTruthy();
    fireEvent.press(screen.getByText('Tekrar Dene'));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows the empty state when there is no help content', () => {
    mockQuery({ data: [] });
    renderWithTamagui(<HelpScreen />);

    expect(screen.getByText('İçerik Bulunamadı')).toBeTruthy();
  });
});
