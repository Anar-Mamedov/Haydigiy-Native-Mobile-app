import { fireEvent, screen } from '@testing-library/react-native';
import { ProductStickyFooter } from './product-sticky-footer';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const baseProps = {
  price: 199.9,
  onAddToCart: jest.fn(),
  onWhatsappPress: jest.fn(),
};

describe('ProductStickyFooter', () => {
  it('adds to cart when approved for sale', () => {
    const onAddToCart = jest.fn();

    renderWithTamagui(<ProductStickyFooter {...baseProps} onAddToCart={onAddToCart} isApprovedForSale />);

    const button = screen.getByLabelText('Sepete ekle');
    expect(button).toBeEnabled();
    fireEvent.press(button);

    expect(onAddToCart).toHaveBeenCalledTimes(1);
  });

  it('disables the add-to-cart button when not approved for sale', () => {
    renderWithTamagui(<ProductStickyFooter {...baseProps} isApprovedForSale={false} />);

    expect(screen.getByLabelText('Sepete ekle')).toBeDisabled();
  });

  it('triggers the WhatsApp handler', () => {
    const onWhatsappPress = jest.fn();

    renderWithTamagui(<ProductStickyFooter {...baseProps} onWhatsappPress={onWhatsappPress} />);

    fireEvent.press(screen.getByLabelText('WhatsApp ile sipariş ve destek'));

    expect(onWhatsappPress).toHaveBeenCalledTimes(1);
  });

  it('keeps footer actions above the device bottom safe area', () => {
    renderWithTamagui(<ProductStickyFooter {...baseProps} />);

    expect(screen.getByTestId('product-sticky-footer')).toHaveStyle({
      paddingBottom: 34,
    });
  });

  it('shows the last-one hint only when isLastOne is set', () => {
    const { queryByText, rerender } = renderWithTamagui(
      <ProductStickyFooter {...baseProps} isLastOne={false} />,
    );

    expect(queryByText('Son 1 Ürün!')).toBeNull();

    rerender(<ProductStickyFooter {...baseProps} isLastOne />);

    expect(queryByText('Son 1 Ürün!')).toBeTruthy();
  });
});
