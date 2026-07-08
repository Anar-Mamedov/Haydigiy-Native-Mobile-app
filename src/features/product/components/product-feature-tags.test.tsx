import { act, screen } from '@testing-library/react-native';
import { YStack } from 'tamagui';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductFeatureAssetTicker, ProductFeatureDescriptionTicker } from './product-feature-tags';
import { FeatureIcon } from '@/types/product.types';

const featureIcons: FeatureIcon[] = [
  {
    id: 15,
    name: 'Butik Kontrol',
    slug: 'butik-kontrol',
    description: 'Butik kontrol edildi',
    descriptionBgColor: '#111111',
    assetUrl: 'https://cdn.example.com/tags/butik.png',
    displayOrder: 2,
  },
  {
    id: 20,
    name: 'Peşin Fiyatına 3 Taksit',
    slug: 'pesin-fiyatina-3-taksit',
    description: 'Peşin Fiyatına 3 Taksit',
    descriptionBgColor: '#FF8800',
    assetUrl: 'https://cdn.example.com/tags/installment.png',
    displayOrder: 1,
  },
];

describe('product feature tags', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows feature assets and descriptions one by one in backend order', () => {
    renderWithTamagui(
      <YStack>
        <ProductFeatureAssetTicker featureIcons={featureIcons} />
        <ProductFeatureDescriptionTicker featureIcons={featureIcons} />
      </YStack>,
    );

    expect(screen.getByText('Peşin Fiyatına 3 Taksit')).toBeTruthy();
    expect(screen.getByLabelText('Peşin Fiyatına 3 Taksit ürün etiketi')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText('Butik kontrol edildi')).toBeTruthy();
    expect(screen.getByLabelText('Butik Kontrol ürün etiketi')).toBeTruthy();
  });
});
