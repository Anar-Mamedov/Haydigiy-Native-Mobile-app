import { fireEvent, screen } from '@testing-library/react-native';
import { InsiderRecommendationSlider } from './insider-recommendation-slider';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { InsiderRecommendedProduct } from '../utils/insider-recommendation.mapper';

function makeProduct(overrides: Partial<InsiderRecommendedProduct> = {}): InsiderRecommendedProduct {
  return {
    id: '1361384',
    name: 'Kadın Bluz',
    imageUrl: 'https://cdn.example.com/1.jpg',
    url: 'https://haydigiy.com/product/kadin-bluz',
    brand: 'HaydiGiy',
    price: 149.9,
    originalPrice: 199.9,
    inStock: true,
    taxonomy: ['Giyim'],
    ...overrides,
  };
}

function renderSlider(props: Partial<React.ComponentProps<typeof InsiderRecommendationSlider>> = {}) {
  const onProductPress = jest.fn();
  const onRetry = jest.fn();

  renderWithTamagui(
    <InsiderRecommendationSlider
      isError={false}
      isLoading={false}
      onProductPress={onProductPress}
      onRetry={onRetry}
      products={[makeProduct()]}
      title="Sana Özel Öneriler"
      {...props}
    />,
  );

  return { onProductPress, onRetry };
}

describe('InsiderRecommendationSlider', () => {
  it('renders the campaign title and product with both prices', () => {
    renderSlider();

    expect(screen.getByText('Sana Özel Öneriler')).toBeTruthy();
    expect(screen.getByText('Kadın Bluz')).toBeTruthy();
    expect(screen.getByText('HaydiGiy')).toBeTruthy();
    // İndirimli fiyat + üstü çizili liste fiyatı
    expect(screen.getByText(/149,90/)).toBeTruthy();
    expect(screen.getByText(/199,90/)).toBeTruthy();
  });

  it('reports the pressed product', () => {
    const { onProductPress } = renderSlider();

    fireEvent.press(screen.getByLabelText('Önerilen ürünü aç: Kadın Bluz'));

    expect(onProductPress).toHaveBeenCalledWith(makeProduct());
  });

  it('shows a skeleton while loading', () => {
    renderSlider({ isLoading: true, products: [] });

    expect(screen.getAllByLabelText('Öneriler yükleniyor').length).toBeGreaterThan(0);
    expect(screen.queryByText('Kadın Bluz')).toBeNull();
  });

  it('offers a retry when the request failed', () => {
    const { onRetry } = renderSlider({ isError: true, products: [] });

    expect(screen.getByText('Öneriler yüklenemedi.')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Önerileri tekrar dene'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // Boş bir başlık bırakmak ekranda anlamsız bir boşluk üretir.
  it('renders nothing when there is no recommendation', () => {
    renderSlider({ products: [] });

    expect(screen.queryByTestId('insider-recommendation-slider')).toBeNull();
  });

  it('hides the strike-through price when the product is not discounted', () => {
    renderSlider({ products: [makeProduct({ price: 199.9, originalPrice: null })] });

    expect(screen.getAllByText(/199,90/)).toHaveLength(1);
  });
});
