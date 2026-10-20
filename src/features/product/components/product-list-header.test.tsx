import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductListHeader } from './product-list-header';

const LONG_TITLE = 'Kadın Büyük Beden Elbise & İkili Takım Koleksiyonu';

describe('ProductListHeader', () => {
  it.each(['light', 'dark'] as const)('wraps a long category name to two lines in the %s theme', (theme) => {
    renderWithTamagui(
      <ProductListHeader cartCount={0} onBack={jest.fn()} onCartPress={jest.fn()} title={LONG_TITLE} />,
      theme,
    );

    const title = screen.getByRole('header');
    expect(title).toHaveTextContent(LONG_TITLE);
    expect(title.props.numberOfLines).toBe(2);
  });

  it('keeps the back and cart actions', () => {
    const onBack = jest.fn();
    const onCartPress = jest.fn();
    renderWithTamagui(
      <ProductListHeader cartCount={3} onBack={onBack} onCartPress={onCartPress} title="Elbise" />,
    );

    fireEvent.press(screen.getByLabelText('Sepete git'));
    expect(onCartPress).toHaveBeenCalled();
    expect(screen.getByTestId('product-list-cart-badge')).toHaveTextContent('3');
  });
});
