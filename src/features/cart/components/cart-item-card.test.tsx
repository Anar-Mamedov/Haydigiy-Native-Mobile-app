import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CartItemCard } from './cart-item-card';
import { CartLineItem } from '@/types/cart.types';

// `@/components/ui` barrel'ı expo-router'a bağlı bileşenleri de çekiyor; bu test
// yalnızca sepet kartını doğruluyor, yönlendirme mock'lanır.
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  usePathname: () => '/cart',
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

const BUNDLE_LINE: CartLineItem = {
  imageUrl: 'https://cdn/bundle.webp',
  productId: '97045',
  quantity: 1,
  sellerName: '',
  title: 'Deneme bundle',
  unitPrice: 2000,
  itemType: 'bundle',
  bundleGroupId: '101703d9',
  bundleComponents: [
    {
      key: 'c1',
      orderItemId: null,
      title: 'Kemer Detaylı Elbise',
      slug: 'kemer-detayli-elbise',
      imageUrl: '',
      variantName: 'L',
      quantity: 1,
      price: 1250,
    },
  ],
};

const PRODUCT_LINE: CartLineItem = {
  imageUrl: 'https://cdn/gomlek.webp',
  productId: '95236',
  quantity: 1,
  sellerName: '',
  title: 'Uzun Kollu Gömlek',
  unitPrice: 309.99,
  variantId: '4321',
  size: 'M',
  stock: 1,
};

function renderCard(
  overrides: Partial<React.ComponentProps<typeof CartItemCard>> = {},
  theme?: 'light' | 'dark',
) {
  const onQuantityChange = overrides.onQuantityChange ?? jest.fn();
  const onRemovePress = overrides.onRemovePress ?? jest.fn();
  const onPressProduct = overrides.onPressProduct ?? jest.fn();
  const onPressBundleComponent = overrides.onPressBundleComponent ?? jest.fn();

  const utils = renderWithTamagui(
    <CartItemCard
      deliveryMessage="Yarın kargoda"
      item={BUNDLE_LINE}
      {...overrides}
      onPressBundleComponent={onPressBundleComponent}
      onPressProduct={onPressProduct}
      onQuantityChange={onQuantityChange}
      onRemovePress={onRemovePress}
    />,
    theme,
  );

  return { ...utils, onQuantityChange, onRemovePress, onPressProduct, onPressBundleComponent };
}

describe('CartItemCard — paket satırı', () => {
  it('marks the line as a package', () => {
    renderCard();

    expect(screen.getByText('PAKET')).toBeTruthy();
  });

  it('shows the package as one line with its contents listed underneath', () => {
    renderCard();

    fireEvent.press(screen.getByLabelText('Paket içeriği, 1 ürün'));

    expect(screen.getByText('Kemer Detaylı Elbise')).toBeTruthy();
  });

  it('opens a content product when it is tapped', () => {
    const { onPressBundleComponent } = renderCard();

    fireEvent.press(screen.getByLabelText('Paket içeriği, 1 ürün'));
    fireEvent.press(screen.getByLabelText('Kemer Detaylı Elbise ürün detayı'));

    expect(onPressBundleComponent).toHaveBeenCalledWith(BUNDLE_LINE.bundleComponents?.[0]);
  });

  it('changes the quantity for the package as a whole', () => {
    const { onQuantityChange } = renderCard();

    fireEvent.press(screen.getByLabelText('Deneme bundle artır'));

    expect(onQuantityChange).toHaveBeenCalledWith(2);
  });

  it('removes the package as one piece', () => {
    const { onRemovePress } = renderCard();

    fireEvent.press(screen.getByLabelText('Deneme bundle ürününü sepetten kaldır'));

    expect(onRemovePress).toHaveBeenCalledTimes(1);
  });

  it('never shows a size row or a stock badge for a package', () => {
    // Paket satırı stok bildirmez; "Son 1 Ürün!" rozeti yanlışlıkla çıkmamalı.
    renderCard({ item: { ...BUNDLE_LINE, size: 'L', stock: 1 } });

    expect(screen.queryByText(/^Beden:/)).toBeNull();
    expect(screen.queryByText('Son 1 Ürün!')).toBeNull();
    expect(screen.queryByText('Stokta tükeniyor')).toBeNull();
  });

  it('keeps the package labels readable in the dark theme', () => {
    renderCard({}, 'dark');

    expect(screen.getByText('PAKET')).toBeTruthy();
    expect(screen.getByText('Deneme bundle')).toBeTruthy();
  });
});

describe('CartItemCard — normal ürün', () => {
  it('keeps size and stock badges and shows no package marker', () => {
    renderCard({ item: PRODUCT_LINE });

    expect(screen.getByText('M')).toBeTruthy();
    expect(screen.getByText('Son 1 Ürün!')).toBeTruthy();
    expect(screen.queryByText('PAKET')).toBeNull();
    expect(screen.queryByText(/Paket içeriği/)).toBeNull();
  });
});
