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

function renderCard({ attached, item = GIFT_LINE, theme }: { attached?: boolean; item?: CartLineItem; theme?: 'light' | 'dark' } = {}) {
  const onPressProduct = jest.fn();
  const onRemovePress = jest.fn();
  renderWithTamagui(
    <CartGiftItemCard attached={attached} item={item} onPressProduct={onPressProduct} onRemovePress={onRemovePress} />,
    theme,
  );
  return { onPressProduct, onRemovePress };
}

describe('CartGiftItemCard', () => {
  it('shows a compact free gift row: HEDİYE and one size · quantity · free line', () => {
    renderCard();

    expect(screen.getByText('HEDİYE')).toBeTruthy();
    expect(screen.getByText('Beden: Standart · 2 adet · Ücretsiz')).toBeTruthy();
    expect(screen.queryByText('Kampanya hediyesi · Adet değiştirilemez')).toBeNull();
  });

  it('keeps the product name out of sight but in the screen reader labels', () => {
    renderCard();

    expect(screen.queryByText('Pamuklu Çorap')).toBeNull();
    expect(screen.getByLabelText('Pamuklu Çorap ürün detayı')).toBeTruthy();
    expect(screen.getByLabelText('Pamuklu Çorap hediyesini sil')).toBeTruthy();
  });

  it('drops the size from the line when the gift has none', () => {
    renderCard({ item: { ...GIFT_LINE, size: undefined, quantity: 1 } });

    expect(screen.getByText('1 adet · Ücretsiz')).toBeTruthy();
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

  it('drops its own frame when attached under its product card', () => {
    renderCard({ attached: true });

    expect(screen.queryByTestId('cart-gift-item-card')).toBeNull();
    expect(screen.getByTestId('cart-gift-item-attached')).toBeTruthy();
    expect(screen.getByLabelText('Pamuklu Çorap hediyesini sil')).toBeTruthy();
  });

  it('keeps its labels and the remove control readable in the dark theme', () => {
    renderCard({ theme: 'dark' });

    expect(screen.getByText('HEDİYE')).toBeTruthy();
    expect(screen.getByText('Beden: Standart · 2 adet · Ücretsiz')).toBeTruthy();
    expect(screen.getByLabelText('Pamuklu Çorap hediyesini sil')).toBeTruthy();
  });
});
