import { ScrollView, StyleSheet } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { FlashList } from '@shopify/flash-list';
import { notifyTabReselect } from '@/components/navigation/tab-reselect';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { Section } from '@/types/page-design.types';
import { HomeScreen } from './home-screen';

const mockRefetch = jest.fn();
const mockDesignQuery = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/features/product/api/page-design.queries', () => ({
  useMobilePageDesignQuery: () => mockDesignQuery(),
}));

jest.mock('@/features/insider/hooks/use-insider-page-tracking', () => ({
  useTrackHomePageView: jest.fn(),
}));

jest.mock('@/features/insider/hooks/use-last-viewed-insider-product', () => ({
  useLastViewedInsiderProduct: () => null,
}));

jest.mock('@/features/insider/components/insider-recommendation-sections', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return { InsiderRecommendationSections: () => <MockText>Öneriler</MockText> };
});

jest.mock('@/features/product/components/home-footer', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return { HomeFooter: () => <MockText>Alt bilgi</MockText> };
});

jest.mock('@/features/product/components/mobile-home-search', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return { MobileHomeSearch: () => <MockText>Ara</MockText> };
});

jest.mock('@/features/promotions/components/top-banner', () => ({ TopBanner: () => null }));

jest.mock('@/components/ui/app-header', () => ({ AppHeader: () => null }));

jest.mock('@/utils/link-handler', () => ({ handleLinkPress: jest.fn() }));

const banner = (id: number, order: number, widthRatio: number, text: string): Section => ({
  content: { items: [{ id, image: `https://cdn.haydigiy.com/banners/${id}.webp`, link: '/x', text }] },
  created_at: '',
  id,
  margins: null,
  order,
  page_design_id: 1,
  status: true,
  type: 'banner',
  updated_at: '',
  width_ratio: widthRatio,
});

const sections: Section[] = [
  banner(3, 2, 6, 'Sağ'),
  banner(1, 0, 12, 'Ana kampanya'),
  banner(2, 1, 6, 'Sol'),
  { ...banner(4, 3, 12, 'Kapalı'), status: false },
];

/** Width of the banner section that holds the banner with `label` (first host ancestor with a numeric width). */
const sectionWidth = (label: string): number => {
  let node: ReactTestInstance | null = screen.getByLabelText(label).parent;
  while (node) {
    const width = typeof node.type === 'string' ? StyleSheet.flatten(node.props.style)?.width : undefined;
    if (typeof width === 'number') return width;
    node = node.parent;
  }
  throw new Error(`No sized ancestor for ${label}`);
};

const mockSuccess = () =>
  mockDesignQuery.mockReturnValue({
    data: { device: 'mobile', id: 1, name: 'Ana sayfa', sections },
    isError: false,
    isPending: false,
    refetch: mockRefetch,
  });

beforeEach(() => {
  mockDesignQuery.mockReset();
  mockRefetch.mockReset().mockResolvedValue({});
});

describe('HomeScreen', () => {
  it('shows a loader while the page design loads', () => {
    mockDesignQuery.mockReturnValue({ data: undefined, isError: false, isPending: true, refetch: mockRefetch });
    renderWithTamagui(<HomeScreen />);

    expect(screen.getByText('Yükleniyor...')).toBeTruthy();
    expect(screen.queryByTestId('home-section-list')).toBeNull();
  });

  it('offers a retry when the page design fails', () => {
    mockDesignQuery.mockReturnValue({ data: undefined, isError: true, isPending: false, refetch: mockRefetch });
    renderWithTamagui(<HomeScreen />);

    expect(screen.getByText('Sayfa Yüklenemedi')).toBeTruthy();
    fireEvent.press(screen.getByText('Tekrar Dene'));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders the design rows, recommendations and footer as items of one virtualized list', () => {
    mockSuccess();
    renderWithTamagui(<HomeScreen />);

    const list = screen.UNSAFE_getByType(FlashList);
    expect(list.props.data.map((item: { key: string }) => item.key)).toEqual([
      'row-1',
      'row-2-3',
      'recommendations',
      'footer',
    ]);

    expect(screen.getByText('Ara')).toBeTruthy();
    expect(screen.getByLabelText('Ana kampanya')).toBeTruthy();
    expect(screen.queryByLabelText('Kapalı')).toBeNull();
    expect(screen.getByText('Öneriler')).toBeTruthy();
    expect(screen.getByText('Alt bilgi')).toBeTruthy();
  });

  it('lays half-width banners side by side', () => {
    mockSuccess();
    renderWithTamagui(<HomeScreen />);

    const full = sectionWidth('Ana kampanya');
    const left = sectionWidth('Sol');

    expect(sectionWidth('Sağ')).toBe(left);
    // Two halves plus the 5 px gap fill the row.
    expect(left * 2 + 5).toBeCloseTo(full);
  });

  it('scrolls the list back to the top when the home tab is pressed again', () => {
    mockSuccess();
    renderWithTamagui(<HomeScreen />);

    const scrollView = screen.UNSAFE_getByType(ScrollView).instance as { scrollTo: jest.Mock };
    scrollView.scrollTo.mockClear();

    act(() => notifyTabReselect('/'));

    expect(scrollView.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ animated: true, y: 0 }));
  });

  it('refetches the design on pull to refresh', async () => {
    mockSuccess();
    renderWithTamagui(<HomeScreen />);

    await act(async () => {
      screen.UNSAFE_getByType(FlashList).props.refreshControl.props.onRefresh();
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
