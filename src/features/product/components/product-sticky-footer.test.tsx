import { fireEvent, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ProductStickyFooter } from './product-sticky-footer';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const baseProps = {
  price: 199.9,
  onAddToCart: jest.fn(),
  onNotifyMe: jest.fn(),
  onWhatsappPress: jest.fn(),
};

describe('ProductStickyFooter', () => {
  it('keeps the regular orange price box when the product has no discount', () => {
    renderWithTamagui(<ProductStickyFooter {...baseProps} />);

    expect(screen.queryByTestId('product-sticky-footer-discount-price')).toBeNull();
    expect(screen.getByText('199,90')).toBeTruthy();
    expect(screen.getByText('TL')).toBeTruthy();
  });

  it('shows the discount box with the rate badge and the struck-through first price', () => {
    renderWithTamagui(
      <ProductStickyFooter {...baseProps} discountRate={20} firstPrice={249.9} hasDiscount />,
    );

    expect(screen.getByTestId('product-sticky-footer-discount-price')).toBeTruthy();
    expect(screen.getByText('%20')).toBeTruthy();
    expect(screen.getByText('199,90 TL')).toBeTruthy();

    const firstPrice = screen.getByText('249,90 TL');
    expect(StyleSheet.flatten(firstPrice.props.style)?.textDecorationLine).toBe('line-through');
  });

  it('falls back to the regular box when the discount flag has no usable data', () => {
    renderWithTamagui(<ProductStickyFooter {...baseProps} hasDiscount />);

    expect(screen.queryByTestId('product-sticky-footer-discount-price')).toBeNull();
    expect(screen.getByText('199,90')).toBeTruthy();
  });

  it('keeps the discounted price readable after switching to the dark theme', () => {
    renderWithTamagui(
      <ProductStickyFooter {...baseProps} discountRate={20} firstPrice={249.9} hasDiscount />,
      'dark',
    );

    expect(screen.getByText('%20')).toBeTruthy();
    expect(screen.getByText('199,90 TL')).toBeTruthy();
    expect(screen.getByText('249,90 TL')).toBeTruthy();
  });

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

  it('offers the stock notification instead of add-to-cart when the size is sold out', () => {
    const onNotifyMe = jest.fn();

    renderWithTamagui(
      <ProductStickyFooter {...baseProps} isOutOfStock onNotifyMe={onNotifyMe} />,
    );

    expect(screen.queryByLabelText('Sepete ekle')).toBeNull();
    fireEvent.press(screen.getByLabelText('Ürün gelince haber ver'));

    expect(onNotifyMe).toHaveBeenCalledTimes(1);
  });

  // Eskiden misafire devre dışı bir "Tükendi" butonu gösteriliyordu; artık
  // bildirim herkese açık, giriş gerekliliğini `useNotifyStock` yönetiyor.
  it('no longer hides the notification behind a disabled sold-out button', () => {
    renderWithTamagui(<ProductStickyFooter {...baseProps} isOutOfStock />);

    expect(screen.queryByLabelText('Tükendi')).toBeNull();
    expect(screen.getByLabelText('Ürün gelince haber ver')).toBeTruthy();
  });

  it('confirms the request once it has been sent for that size', () => {
    renderWithTamagui(<ProductStickyFooter {...baseProps} isNotified isOutOfStock />);

    expect(screen.getByLabelText('Stok bildirimi talebin alındı')).toBeDisabled();
  });

  it('blocks a second submit while the request is in flight', () => {
    const onNotifyMe = jest.fn();

    renderWithTamagui(
      <ProductStickyFooter {...baseProps} isNotifying isOutOfStock onNotifyMe={onNotifyMe} />,
    );

    expect(screen.getByText('Gönderiliyor...')).toBeTruthy();
    expect(screen.getByLabelText('Ürün gelince haber ver')).toBeDisabled();
  });

  it('keeps add-to-cart when the product is closed for sale, even if sold out', () => {
    renderWithTamagui(
      <ProductStickyFooter {...baseProps} isApprovedForSale={false} isOutOfStock />,
    );

    expect(screen.getByLabelText('Sepete ekle')).toBeDisabled();
  });

  // AGENTS.md: tema duyarlı paylaşılan bileşenler dark modda da doğrulanmalı.
  it('keeps every sold-out action readable in dark theme', () => {
    renderWithTamagui(<ProductStickyFooter {...baseProps} isOutOfStock />, 'dark');
    expect(screen.getByText('Gelince Haber Ver')).toBeTruthy();

    renderWithTamagui(<ProductStickyFooter {...baseProps} isNotified isOutOfStock />, 'dark');
    expect(screen.getByText('Talebini Aldık')).toBeTruthy();
  });

});
