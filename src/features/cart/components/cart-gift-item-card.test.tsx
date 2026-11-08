import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CartGiftItemCard } from './cart-gift-item-card';
import { CartLineItem } from '@/types/cart.types';

const GIFT_LINE: CartLineItem = {
  imageUrl: 'https://cdn/corap.webp',
  productId: '77',
  quantity: 2,
  sellerName: '',
  title: 'Pamuklu Çorap',
  unitPrice: 0,
  variantId: '3001',
  cartItemId: '902',
  size: 'Standart',
  isGift: true,
};

function renderCard(theme?: 'light' | 'dark') {
  const onPressProduct = jest.fn();
  const onRemovePress = jest.fn();
  renderWithTamagui(
    <CartGiftItemCard item={GIFT_LINE} onPressProduct={onPressProduct} onRemovePress={onRemovePress} />,
    theme,
  );
  return { onPressProduct, onRemovePress };
}

describe('CartGiftItemCard', () => {
  it('marks the row as a free campaign gift', () => {
    renderCard();

    expect(screen.getByText('HEDİYE')).toBeTruthy();
    expect(screen.getByText('Pamuklu Çorap')).toBeTruthy();
    expect(screen.getByText('Ücretsiz')).toBeTruthy();
    expect(screen.getByText(/2 adet ·/)).toBeTruthy();
    expect(screen.getByText('Kampanya hediyesi · Adet değiştirilemez')).toBeTruthy();
  });

  it('offers no quantity control, only removal', () => {
    const { onRemovePress } = renderCard();

    expect(screen.queryByLabelText('Pamuklu Çorap artır')).toBeNull();
    expect(screen.queryByLabelText('Pamuklu Çorap azalt')).toBeNull();

    fireEvent.press(screen.getByLabelText('Pamuklu Çorap hediyesini sil'));
    expect(onRemovePress).toHaveBeenCalledTimes(1);
  });

  it('opens the product from the image', () => {
    const { onPressProduct } = renderCard();

    fireEvent.press(screen.getByLabelText('Pamuklu Çorap ürün detayı'));

    expect(onPressProduct).toHaveBeenCalledTimes(1);
  });

  it('keeps its labels and the remove control readable in the dark theme', () => {
    renderCard('dark');

    expect(screen.getByText('HEDİYE')).toBeTruthy();
    expect(screen.getByText('Ücretsiz')).toBeTruthy();
    expect(screen.getByLabelText('Pamuklu Çorap hediyesini sil')).toBeTruthy();
  });
});
