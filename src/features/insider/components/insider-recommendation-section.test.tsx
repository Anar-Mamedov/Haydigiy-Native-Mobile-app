import { fireEvent, screen } from '@testing-library/react-native';
import { InsiderRecommendationSection } from './insider-recommendation-section';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useInsiderRecommendationQuery } from '../api/insider-recommendation.queries';
import { getInsiderRecommendationId } from '../config/recommendation-campaigns';
import { insiderTracker } from '../services/insider-tracker';
import { InsiderRecommendedProduct } from '../utils/insider-recommendation.mapper';

const push = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: (...args: unknown[]) => push(...args) }),
}));

jest.mock('../api/insider-recommendation.queries', () => ({
  useInsiderRecommendationQuery: jest.fn(),
}));

jest.mock('../config/recommendation-campaigns', () => ({
  getInsiderRecommendationCampaign: () => ({ id: 9, title: 'Sana Özel Öneriler' }),
  getInsiderRecommendationId: jest.fn(() => 9),
}));

jest.mock('../services/insider-tracker', () => ({
  insiderTracker: { trackRecommendationClick: jest.fn() },
}));

const useQueryMock = useInsiderRecommendationQuery as jest.Mock;
const getIdMock = getInsiderRecommendationId as jest.Mock;
const trackClick = insiderTracker.trackRecommendationClick as jest.Mock;

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
  push.mockClear();
  trackClick.mockClear();
  getIdMock.mockReturnValue(9);
  useQueryMock.mockReturnValue({
    data: { products: [product], productIds: [product.id] },
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
  });
});

describe('InsiderRecommendationSection', () => {
  it('renders the campaign slider', () => {
    renderWithTamagui(<InsiderRecommendationSection slot="home" />);

    expect(screen.getByText('Sana Özel Öneriler')).toBeTruthy();
    expect(screen.getByText('Kadın Bluz')).toBeTruthy();
  });

  /**
   * Tıklama logu, sepete ekleme ve satın alma istatistiklerinin ön koşulu:
   * yönlendirmeden önce gitmeli, yoksa panelde öneriye bağlanmaz.
   */
  it('logs the click before navigating to the product', () => {
    renderWithTamagui(<InsiderRecommendationSection slot="home" />);

    fireEvent.press(screen.getByLabelText('Önerilen ürünü aç: Kadın Bluz'));

    expect(trackClick).toHaveBeenCalledWith(9, expect.objectContaining({ id: '1361384' }));
    expect(push).toHaveBeenCalledWith('/product/kadin-bluz');
    expect(trackClick.mock.invocationCallOrder[0]).toBeLessThan(push.mock.invocationCallOrder[0]);
  });

  // Kampanya panelde açılmadan ekranda hiçbir şey görünmemeli.
  it('renders nothing when the campaign id is not configured yet', () => {
    getIdMock.mockReturnValue(null);

    renderWithTamagui(<InsiderRecommendationSection slot="home" />);

    expect(screen.queryByText('Sana Özel Öneriler')).toBeNull();
  });
});
