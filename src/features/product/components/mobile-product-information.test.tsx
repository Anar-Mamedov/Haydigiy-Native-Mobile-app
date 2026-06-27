import { screen } from '@testing-library/react-native';
import { MobileProductInformation } from './mobile-product-information';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('MobileProductInformation', () => {
  it('renders product description markdown without raw markdown markers', () => {
    renderWithTamagui(
      <MobileProductInformation
        productData={{
          description: '# Şerit Detaylı Crop Ceket\n\nBu şık **crop ceket** modeli.',
          imageUrl: '',
        }}
      />
    );

    expect(screen.getByText('Ürün Açıklaması')).toBeTruthy();
    expect(screen.getByText('Şerit Detaylı Crop Ceket')).toBeTruthy();
    expect(screen.getByText('crop ceket')).toBeTruthy();
    expect(screen.queryByText(/# Şerit Detaylı Crop Ceket/)).toBeNull();
    expect(screen.queryByText(/\*\*crop ceket\*\*/)).toBeNull();
  });
});
