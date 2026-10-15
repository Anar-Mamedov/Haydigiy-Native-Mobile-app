import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { TopBanner } from './top-banner';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { TopBannerData } from '../types/top-banner.types';

const mockPush = jest.fn();
const mockDismiss = jest.fn();
let mockBanner: TopBannerData;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../api/top-banner.queries', () => ({
  useActiveTopBannersQuery: () => ({ data: [mockBanner], isError: false, isPending: false }),
}));

jest.mock('../hooks/use-top-banner', () => ({
  useTopBanner: () => ({
    currentBanner: mockBanner,
    handleDismiss: mockDismiss,
    mounted: true,
    progress: 0,
    timeLeft: null,
    visibleBanners: [mockBanner],
  }),
}));

function makeBanner(overrides: Partial<TopBannerData> = {}): TopBannerData {
  return {
    animation_type: 'none',
    bg_color_from: '#000000',
    bg_color_to: '#111111',
    countdown_enabled: false,
    countdown_end_at: null,
    device: 'all',
    dismissible: true,
    end_at: null,
    id: 1,
    image_mobile: 'top-banners/kis.webp',
    image_web: null,
    link: '/kategori/kis',
    pages: null,
    priority: 1,
    subtext: null,
    target_audience: 'all',
    text: null,
    text_color: '#ffffff',
    title: 'Kış İndirimi',
    type: 'image',
    ...overrides,
  };
}

describe('TopBanner', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockDismiss.mockClear();
    mockBanner = makeBanner();
  });

  it('names the image banner after the campaign and exposes it as a link', () => {
    // Regresyon: görsel şerit etiketsizdi; Play "İçerik etiketleme" uyarısı veriyordu.
    renderWithTamagui(<TopBanner />);

    const banner = screen.getByLabelText('Kış İndirimi');
    expect(banner.props.accessibilityRole).toBe('link');

    fireEvent.press(banner);
    expect(mockPush).toHaveBeenCalledWith('/kategori/kis');
  });

  it('reads a link-less image banner as an image', () => {
    mockBanner = makeBanner({ link: null });
    renderWithTamagui(<TopBanner />);

    expect(screen.getByLabelText('Kış İndirimi').props.accessibilityRole).toBe('image');
  });

  it('gives the small dismiss circle a 48dp touch area', () => {
    // Regresyon: 20dp kapatma dairesi Play "Dokunma hedefi boyutu" uyarısı veriyordu.
    renderWithTamagui(<TopBanner />);

    const dismiss = screen.getByLabelText('Kampanyayı kapat');
    expect(StyleSheet.flatten(dismiss.props.style)).toMatchObject({ minHeight: 48, minWidth: 48 });

    fireEvent.press(dismiss);
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('gives the text banner dismiss button a 48dp touch area', () => {
    mockBanner = makeBanner({ image_mobile: null, text: 'Kargo bedava', type: 'text' });
    renderWithTamagui(<TopBanner />);

    expect(screen.getByText('Kargo bedava')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByLabelText('Kampanyayı kapat').props.style)).toMatchObject({
      minHeight: 48,
      minWidth: 48,
    });
  });

  it('renders the banner and its dismiss control in the dark theme', () => {
    renderWithTamagui(<TopBanner />, 'dark');

    expect(screen.getByLabelText('Kış İndirimi')).toBeTruthy();
    expect(screen.getByLabelText('Kampanyayı kapat')).toBeTruthy();
  });
});
