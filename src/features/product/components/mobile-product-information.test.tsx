import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
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

describe('MobileProductInformation touch targets', () => {
  const properties = Array.from({ length: 7 }, (_, index) => ({ name: `Özellik ${index + 1}`, value: `Değer ${index + 1}` }));

  it('toggles the description from a 48dp "DAHA FAZLA GÖSTER" action that announces its state', () => {
    renderWithTamagui(
      <MobileProductInformation productData={{ description: 'Uzun açıklama', imageUrl: '' }} properties={properties} />,
    );

    const [toggle] = screen.getAllByLabelText('DAHA FAZLA GÖSTER');
    expect(StyleSheet.flatten(toggle.props.style)).toMatchObject({ alignSelf: 'flex-start', minHeight: 48 });
    expect(toggle.props.accessibilityState).toMatchObject({ expanded: false });
    expect(screen.queryByText('Özellik 7')).toBeNull();

    fireEvent.press(toggle);

    expect(screen.getByText('Özellik 7')).toBeTruthy();
    expect(screen.getAllByLabelText('DAHA AZ GÖSTER')[0].props.accessibilityState).toMatchObject({ expanded: true });
  });

  it('keeps the washing instructions button at 48dp in the dark theme', () => {
    renderWithTamagui(
      <MobileProductInformation
        onWashingInstructionsPress={jest.fn()}
        productData={{ description: 'Açıklama', imageUrl: '' }}
      />,
      'dark',
    );

    const button = screen.getByRole('button', { name: /Yıkama Talimatları/ });
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({ height: 48 });
    expect(screen.getByText('Yıkama Talimatları')).toBeTruthy();
  });
});
