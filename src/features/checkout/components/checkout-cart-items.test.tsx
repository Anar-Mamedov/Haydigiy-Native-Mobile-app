import { fireEvent } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CheckoutCartItems } from './checkout-cart-items';
import { CartLineItem } from '@/types/cart.types';
import { formatCurrency } from '@/utils/format-currency';

// `@/components/ui` barrel'ı expo-router'a bağlı bileşenleri de çekiyor; bu test
// yalnızca sepet şeridini doğruluyor, yönlendirme mock'lanır.
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  usePathname: () => '/checkout',
  Link: ({ children }: { children: React.ReactNode }) => children,
}));


const bundleLine: CartLineItem = {
  imageUrl: 'https://cdn/deneme-bundle.webp',
  productId: '97045',
  quantity: 1,
  sellerName: '',
  title: 'Deneme bundle',
  unitPrice: 5000,
  itemType: 'bundle',
  bundleGroupId: '101703d9',
  bundleComponents: [
    {
      key: 'c1',
      orderItemId: null,
      title: 'Kemer Detaylı Yarım Kol Elbise Siyah',
      slug: 'kemer-detayli-yarim-kol-elbise-siyah-525212204',
      imageUrl: 'https://cdn/elbise.webp',
      variantName: 'L',
      quantity: 1,
      price: 1250,
    },
  ],
};

const productLine: CartLineItem = {
  imageUrl: 'https://cdn/gomlek.webp',
  productId: '95236',
  quantity: 2,
  sellerName: '',
  title: 'Uzun Kollu Cepli Gömlek Siyah',
  unitPrice: 309.99,
  variantId: '4321',
  size: 'STANDART',
  itemType: 'product',
};

function renderItems(overrides: Partial<React.ComponentProps<typeof CheckoutCartItems>> = {}) {
  return renderWithTamagui(
    <CheckoutCartItems
      expanded
      items={[bundleLine, productLine]}
      onPressItem={jest.fn()}
      onToggle={jest.fn()}
      {...overrides}
    />,
  );
}

describe('CheckoutCartItems — bundle', () => {
  it('marks the bundle tile as a package', () => {
    const { getByText } = renderItems();
    expect(getByText('PAKET')).toBeTruthy();
  });

  it('lists the package contents under the thumbnails', () => {
    const { getByLabelText, getByText } = renderItems();

    // İçerik listesi katlanabilir; başlığa dokununca açılır.
    fireEvent.press(getByLabelText('Paket içeriği, 1 ürün'));

    expect(getByText('Kemer Detaylı Yarım Kol Elbise Siyah')).toBeTruthy();
  });

  it('opens a component product when it is tapped', () => {
    const onPressBundleComponent = jest.fn();
    const { getByLabelText } = renderItems({ onPressBundleComponent });

    fireEvent.press(getByLabelText('Paket içeriği, 1 ürün'));
    fireEvent.press(getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah ürün detayı'));

    expect(onPressBundleComponent).toHaveBeenCalledWith(bundleLine.bundleComponents?.[0]);
  });

  it('shows no package marker for a normal product', () => {
    const { queryByText } = renderItems({ items: [productLine] });

    expect(queryByText('PAKET')).toBeNull();
    expect(queryByText(/Paket içeriği/)).toBeNull();
  });
});

describe('CheckoutCartItems — fiyat', () => {
  it('shows the plain line total when no campaign applies', () => {
    const { getByText } = renderItems({ items: [productLine] });
    expect(getByText(formatCurrency(619.98))).toBeTruthy();
  });

  // Kampanyalı satırda normal toplam üstü çizili kalır, indirimli toplam altında
  // vurgulanır (web ödeme sayfası paritesi).
  it('strikes the original total and highlights the campaign total', () => {
    const { getByText } = renderItems({
      items: [{ ...productLine, campaignDiscount: 120, campaignTotal: 499.98 }],
    });

    expect(getByText(formatCurrency(619.98))).toHaveStyle({ textDecorationLine: 'line-through' });
    expect(getByText(formatCurrency(499.98))).toBeTruthy();
  });

  it('ignores a campaign total that comes without a discount', () => {
    const { getByText, queryByText } = renderItems({
      items: [{ ...productLine, campaignTotal: 499.98 }],
    });

    expect(getByText(formatCurrency(619.98))).not.toHaveStyle({
      textDecorationLine: 'line-through',
    });
    expect(queryByText(formatCurrency(499.98))).toBeNull();
  });
});
