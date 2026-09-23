import { screen } from '@testing-library/react-native';
import { ProductSizeSpecialPrice } from './product-size-special-price';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { DISCOUNT_BACKGROUND_COLOR, DISCOUNT_BACKGROUND_COLOR_DARK } from '@/lib/theme/colors';

const sizes = [
  { name: 'S', hasStock: true, price: 299.99 },
  { name: 'M', hasStock: true },
];

describe('ProductSizeSpecialPrice', () => {
  it('announces the size sold below the product price', () => {
    renderWithTamagui(<ProductSizeSpecialPrice productPrice={349.99} sizes={sizes} />);

    expect(screen.getByText('299,99 TL')).toBeTruthy();
    expect(screen.getByLabelText('S bedenine özel 299,99 TL')).toBeTruthy();
  });

  it('renders nothing when no size has a special price', () => {
    renderWithTamagui(
      <ProductSizeSpecialPrice productPrice={349.99} sizes={[{ name: 'S', hasStock: true }]} />,
    );

    expect(screen.queryByTestId('product-size-special-price')).toBeNull();
  });

  it('keeps its discount surface in both themes', () => {
    const light = renderWithTamagui(<ProductSizeSpecialPrice productPrice={349.99} sizes={sizes} />);
    expect(light.getByTestId('product-size-special-price')).toHaveStyle({
      backgroundColor: DISCOUNT_BACKGROUND_COLOR,
    });
    light.unmount();

    renderWithTamagui(<ProductSizeSpecialPrice productPrice={349.99} sizes={sizes} />, 'dark');
    expect(screen.getByTestId('product-size-special-price')).toHaveStyle({
      backgroundColor: DISCOUNT_BACKGROUND_COLOR_DARK,
    });
    expect(screen.getByText('299,99 TL')).toBeTruthy();
  });
});
