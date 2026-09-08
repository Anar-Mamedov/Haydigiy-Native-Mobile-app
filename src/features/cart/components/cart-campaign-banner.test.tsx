import { act, fireEvent, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CartCampaignBanner, CartCampaignBannerView } from './cart-campaign-banner';
import { CartCampaignBannerStatus } from '@/types/cart.types';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
}));

const mockBannerQuery = jest.fn();
jest.mock('@/features/cart/api/cart.queries', () => ({
  useCartCampaignBannerQuery: () => mockBannerQuery(),
}));

const SINGLE: CartCampaignBannerStatus = {
  currentAmount: 0,
  slides: [
    {
      id: '1',
      campaignName: 'Sepette 2.000 TL',
      threshold: 2000,
      message: "Kampanyadan faydalanabilmek için sepetine 2.000 TL'lik daha ürün eklemelisin.",
      progress: 0,
    },
  ],
};

const MULTIPLE: CartCampaignBannerStatus = {
  currentAmount: 1219.97,
  slides: [
    {
      id: '62',
      campaignName: 'Kargo Kampanyası',
      threshold: 1,
      message: 'Tebrikler! Ücretsiz kargo hakkı kazandınız.',
      progress: 100,
    },
    {
      id: '63',
      campaignName: 'Sepet İndirimi',
      threshold: 1,
      message: 'Sepet İndirimi ile 36,60 TL indirim uygulandı.',
      progress: 100,
    },
    {
      id: '64',
      campaignName: 'Kategori İndirimi',
      threshold: 1,
      message: 'Kategori İndirimi ile 61,00 TL indirim uygulandı.',
      progress: 100,
    },
  ],
};

/** Karusel sayfa genişliğini ölçene kadar kurulmaz; testte ölçümü taklit eder. */
function measureCarousel(testID: string, width = 320) {
  fireEvent(screen.getByTestId(testID), 'layout', {
    nativeEvent: { layout: { width, height: 120, x: 0, y: 0 } },
  });
}

describe('CartCampaignBannerView', () => {
  it('renders the campaign name, the progress amount and the message', () => {
    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={SINGLE} />);

    expect(screen.getByText('Sepette 2.000 TL')).toBeTruthy();
    expect(screen.getByText('0/2.000 TL')).toBeTruthy();
    expect(screen.getByText(SINGLE.slides[0].message)).toBeTruthy();
  });

  it('shows a single amount when the campaign has no threshold', () => {
    renderWithTamagui(
      <CartCampaignBannerView
        onGoToCart={jest.fn()}
        status={{
          currentAmount: 1250.5,
          slides: [{ ...SINGLE.slides[0], threshold: null }],
        }}
      />,
    );

    expect(screen.getByText('1.250,5 TL')).toBeTruthy();
  });

  it('calls onGoToCart from the accessible call to action', () => {
    const onGoToCart = jest.fn();
    renderWithTamagui(<CartCampaignBannerView onGoToCart={onGoToCart} status={SINGLE} />);

    fireEvent.press(screen.getByLabelText('Sepete git'));

    expect(onGoToCart).toHaveBeenCalledTimes(1);
  });

  it('stays a plain banner with no carousel chrome for a single campaign', () => {
    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={SINGLE} />);

    expect(screen.queryByTestId('cart-campaign-banner-scroll')).toBeNull();
    expect(screen.queryByTestId('cart-campaign-banner-dots')).toBeNull();
  });

  // Bant ürün listesinin üstünde durur; uzun bir kampanya adı ya da mesajı
  // yüksekliği büyütüp listeyi aşağı itmemeli.
  it('caps the campaign name to one line and the message to two', () => {
    const longStatus: CartCampaignBannerStatus = {
      currentAmount: 0,
      slides: [
        {
          ...SINGLE.slides[0],
          campaignName: 'Çok uzun bir kampanya adı burada tek satırda kalmalı yoksa bant büyür',
          message:
            'Çok uzun bir kampanya mesajı burada en fazla iki satır olmalı, aksi halde bant ürün listesini aşağı iter ve ekranın yarısını kaplar.',
        },
      ],
    };

    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={longStatus} />);

    expect(screen.getByText(longStatus.slides[0].campaignName).props.numberOfLines).toBe(1);
    expect(screen.getByText(longStatus.slides[0].message).props.numberOfLines).toBe(2);
  });

  it('keeps a 44pt touch target on the call to action', () => {
    // Bandı kısaltmak için düğme küçültülmemeli; dokunma hedefi altına düşer.
    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={SINGLE} />);

    const cta = StyleSheet.flatten(screen.getByTestId('cart-campaign-banner-cta').props.style) ?? {};

    expect(cta.height ?? cta.minHeight).toBeGreaterThanOrEqual(44);
  });

  it('keeps its labels readable after switching to the dark theme', () => {
    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={SINGLE} />, 'dark');

    expect(screen.getByText('Sepette 2.000 TL')).toBeTruthy();
    expect(screen.getByText('0/2.000 TL')).toBeTruthy();
    expect(screen.getByLabelText('Sepete git')).toBeTruthy();
  });
});

describe('CartCampaignBannerView with several campaigns', () => {
  it('renders every campaign as a swipeable slide with its own name and message', () => {
    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={MULTIPLE} />);
    measureCarousel('cart-campaign-banner');

    expect(screen.getByTestId('cart-campaign-banner-scroll')).toBeTruthy();
    // Sayfaların tamamı ağaçta durur; ekran okuyucudan gizli olanlar için
    // sorguya açıkça dahil edilmeleri gerekir.
    for (const slide of MULTIPLE.slides) {
      expect(screen.getByText(slide.campaignName, { includeHiddenElements: true })).toBeTruthy();
      expect(screen.getByText(slide.message, { includeHiddenElements: true })).toBeTruthy();
    }
  });

  it('exposes only the visible slide to screen readers', () => {
    // Üç sayfa da ağaçta olduğu için önlem alınmazsa ekran okuyucu aynı anda üç
    // "Sepete git" düğmesi ve üç kampanya metni duyurur.
    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={MULTIPLE} />);
    measureCarousel('cart-campaign-banner');

    expect(screen.getAllByLabelText('Sepete git')).toHaveLength(1);
    expect(screen.getByText(MULTIPLE.slides[0].message)).toBeTruthy();
    expect(screen.queryByText(MULTIPLE.slides[1].message)).toBeNull();
  });

  it('shows one dot per campaign and announces the active one', () => {
    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={MULTIPLE} />);
    measureCarousel('cart-campaign-banner');

    expect(screen.getByTestId('cart-campaign-banner-dots')).toBeTruthy();
    expect(screen.getByLabelText('Kampanya 1 / 3')).toBeTruthy();
  });

  it('follows the swiped page', () => {
    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={MULTIPLE} />);
    measureCarousel('cart-campaign-banner');

    fireEvent.scroll(screen.getByTestId('cart-campaign-banner-scroll'), {
      nativeEvent: {
        contentOffset: { x: 640, y: 0 },
        layoutMeasurement: { width: 320, height: 120 },
        contentSize: { width: 960, height: 120 },
      },
    });

    expect(screen.getByLabelText('Kampanya 3 / 3')).toBeTruthy();
  });

  it('advances on its own until the reader takes over', () => {
    jest.useFakeTimers();
    try {
      renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={MULTIPLE} />);
      measureCarousel('cart-campaign-banner');

      act(() => {
        jest.advanceTimersByTime(4000);
      });
      expect(screen.getByLabelText('Kampanya 2 / 3')).toBeTruthy();

      // Kullanıcı kaydırmaya başlayınca otomatik ilerleme durmalı, yoksa okuduğu
      // sayfa altından kayar.
      fireEvent(screen.getByTestId('cart-campaign-banner-scroll'), 'scrollBeginDrag', {
        nativeEvent: {
          contentOffset: { x: 320, y: 0 },
          layoutMeasurement: { width: 320, height: 120 },
          contentSize: { width: 960, height: 120 },
        },
      });

      act(() => {
        jest.advanceTimersByTime(12000);
      });
      expect(screen.getByLabelText('Kampanya 2 / 3')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });

  it('keeps the shared cart total on every slide', () => {
    renderWithTamagui(<CartCampaignBannerView onGoToCart={jest.fn()} status={MULTIPLE} />);
    measureCarousel('cart-campaign-banner');

    expect(
      screen.getAllByText('1.219,97/1 TL', { includeHiddenElements: true }),
    ).toHaveLength(MULTIPLE.slides.length);
  });
});

describe('CartCampaignBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to the cart screen when the call to action is pressed', () => {
    mockBannerQuery.mockReturnValue({ data: SINGLE });
    renderWithTamagui(<CartCampaignBanner />);

    fireEvent.press(screen.getByLabelText('Sepete git'));

    expect(mockPush).toHaveBeenCalledWith('/cart');
  });

  it('renders nothing while there is no campaign to show', () => {
    mockBannerQuery.mockReturnValue({ data: null });
    renderWithTamagui(<CartCampaignBanner />);

    expect(screen.queryByTestId('cart-campaign-banner')).toBeNull();
  });

  it('renders nothing when the status arrives without slides', () => {
    mockBannerQuery.mockReturnValue({ data: { currentAmount: 100, slides: [] } });
    renderWithTamagui(<CartCampaignBanner />);

    expect(screen.queryByTestId('cart-campaign-banner')).toBeNull();
  });

  it('renders nothing while the campaign request is still pending or failed', () => {
    mockBannerQuery.mockReturnValue({ data: undefined });
    renderWithTamagui(<CartCampaignBanner />);

    expect(screen.queryByTestId('cart-campaign-banner')).toBeNull();
  });
});
