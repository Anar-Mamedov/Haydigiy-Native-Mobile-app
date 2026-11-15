import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { AvailableGiftsCardView, AvailableGiftsCardViewProps } from './available-gifts-card';
import { AvailableGift } from '@/types/cart.types';

// `@/components/ui` barrel'ı expo-router'a bağlı bileşenleri de çekiyor.
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  usePathname: () => '/cart',
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

const GIFT: AvailableGift = {
  productId: '77',
  campaignId: '12',
  name: 'Pamuklu Çorap',
  imageUrl: 'https://cdn/corap.jpg',
  quantity: 2,
  sizes: [
    { variantId: '3001', name: 'S', availableQuantity: 5, canAdd: true },
    { variantId: '3002', name: 'M', availableQuantity: 1, canAdd: false },
  ],
};

function renderCard(overrides: Partial<AvailableGiftsCardViewProps> = {}, theme?: 'light' | 'dark') {
  const props: AvailableGiftsCardViewProps = {
    gifts: [GIFT],
    selectedVariantIds: {},
    isAdding: false,
    canAdd: () => false,
    onSelectSize: jest.fn(),
    onAdd: jest.fn(),
    ...overrides,
  };
  renderWithTamagui(<AvailableGiftsCardView {...props} />, theme);
  return props;
}

describe('AvailableGiftsCardView', () => {
  it('says the gift is optional in one short note, without the long explanation', () => {
    renderCard();

    expect(screen.getByText('Hediyenizi seçin')).toBeTruthy();
    expect(screen.getByText('Hediyedir, seçmek zorunda değilsiniz.')).toBeTruthy();
    expect(screen.queryByText(/Bedeninizi seçip/)).toBeNull();
    expect(screen.getByText('2 adet HEDİYE')).toBeTruthy();
  });

  // Web gibi ad görünmez; ekran okuyucu yine hangi hediyeyi seçtiğini duyar.
  it('hides the gift name visually but keeps it in the screen reader labels', () => {
    renderCard();

    expect(screen.queryByText('Pamuklu Çorap')).toBeNull();
    expect(screen.getByLabelText('Pamuklu Çorap hediye ürün görseli')).toBeTruthy();
    expect(screen.getByLabelText('Pamuklu Çorap bedeni')).toBeTruthy();
    expect(screen.getByLabelText('Pamuklu Çorap hediyesini sepete ekle')).toBeTruthy();
  });

  it('renders nothing when there is no gift to pick', () => {
    renderCard({ gifts: [] });

    expect(screen.queryByTestId('available-gifts-card')).toBeNull();
  });

  it('lists an out-of-stock size as not selectable and reports the chosen one', () => {
    const props = renderCard();

    fireEvent.press(screen.getByLabelText('Pamuklu Çorap bedeni'));
    expect(screen.getByLabelText('M (Stok yetersiz)').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );

    fireEvent.press(screen.getByLabelText('S'));
    expect(props.onSelectSize).toHaveBeenCalledWith('77', '3001');
  });

  it('keeps the add button disabled until an addable size is chosen', () => {
    const props = renderCard({ canAdd: () => false });

    const button = screen.getByTestId('available-gift-add-77');
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    fireEvent.press(button);
    expect(props.onAdd).not.toHaveBeenCalled();
  });

  it('adds the gift once a size is chosen', () => {
    const props = renderCard({ canAdd: () => true, selectedVariantIds: { '77': '3001' } });

    fireEvent.press(screen.getByLabelText('Pamuklu Çorap hediyesini sepete ekle'));

    expect(props.onAdd).toHaveBeenCalledWith(GIFT);
  });

  it('shows the progress on the gift being added and locks the size choice', () => {
    renderCard({ isAdding: true, addingProductId: '77', selectedVariantIds: { '77': '3001' } });

    expect(screen.getByText('Ekleniyor…')).toBeTruthy();
    expect(screen.getByLabelText('Pamuklu Çorap bedeni').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('keeps its texts and controls readable in the dark theme', () => {
    renderCard({}, 'dark');

    expect(screen.getByText('Hediyenizi seçin')).toBeTruthy();
    expect(screen.getByText('Hediyeyi ekle')).toBeTruthy();
    expect(screen.getByLabelText('Pamuklu Çorap bedeni')).toBeTruthy();
  });
});
