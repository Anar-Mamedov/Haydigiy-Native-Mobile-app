import { fireEvent, screen } from '@testing-library/react-native';
import { InsiderRecommendationSection } from './insider-recommendation-section';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useInsiderRecommendationQuery } from '../api/insider-recommendation.queries';
import { InsiderRecommendationCampaign } from '../config/recommendation-campaigns';
import { insiderTracker } from '../services/insider-tracker';
import { InsiderRecommendedProduct } from '../utils/insider-recommendation.mapper';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../api/insider-recommendation.queries', () => ({
  useInsiderRecommendationQuery: jest.fn(),
}));

jest.mock('../services/insider-tracker', () => ({
  insiderTracker: { trackRecommendationClick: jest.fn() },
}));

const useQueryMock = useInsiderRecommendationQuery as jest.Mock;
const trackClick = insiderTracker.trackRecommendationClick as jest.Mock;

const campaign: InsiderRecommendationCampaign = {
  id: 1,
  title: 'Birlikte Satın Alınanlar',
  method: 'byProduct',
};

const product: InsiderRecommendedProduct = {
  id: '1361384',
  name: 'Kadın Bluz',
  imageUrl: null,
  url: 'https://haydigiy.com/product/kadin-bluz',
  brand: null,
  price: 199,
  originalPrice: null,
  inStock: true,
  taxonomy: ['Giyim'],
};

beforeEach(() => {
  mockPush.mockClear();
  trackClick.mockClear();
  useQueryMock.mockReturnValue({
    data: { products: [product], productIds: [product.id] },
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
  });
});

describe('InsiderRecommendationSection', () => {
  it('renders the campaign title and its products', () => {
    renderWithTamagui(<InsiderRecommendationSection campaign={campaign} />);

    expect(screen.getByText('Birlikte Satın Alınanlar')).toBeTruthy();
    expect(screen.getByText('Kadın Bluz')).toBeTruthy();
  });

  /**
   * Tıklama logu, sepete ekleme ve satın alma istatistiklerinin ön koşulu: yönlendirmeden
   * önce ve kampanyanın kendi kimliğiyle gitmeli, yoksa panelde öneriye bağlanmaz.
   */
  it('logs the click with the campaign id before navigating', () => {
    renderWithTamagui(<InsiderRecommendationSection campaign={{ ...campaign, id: 5 }} />);

    fireEvent.press(screen.getByLabelText('Önerilen ürünü aç: Kadın Bluz'));

    expect(trackClick).toHaveBeenCalledWith(5, expect.objectContaining({ id: '1361384' }));
    expect(mockPush).toHaveBeenCalledWith('/product/kadin-bluz');
    expect(trackClick.mock.invocationCallOrder[0]).toBeLessThan(
      mockPush.mock.invocationCallOrder[0],
    );
  });

  it('passes the campaign and its inputs to the query', () => {
    renderWithTamagui(
      <InsiderRecommendationSection campaign={campaign} productIds={['10', '11']} />,
    );

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ campaign, productIds: ['10', '11'] }),
    );
  });

  it('renders nothing when the campaign returns no product', () => {
    useQueryMock.mockReturnValue({
      data: { products: [], productIds: [] },
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    renderWithTamagui(<InsiderRecommendationSection campaign={campaign} />);

    expect(screen.queryByText('Birlikte Satın Alınanlar')).toBeNull();
  });
});
