import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OrderCard } from './order-card';
import { BundleComponent } from '@/types/bundle.types';
import { Order, OrderProduct } from '@/types/order.types';

// `@/components/ui` barrel'ı expo-router'a bağlı bileşenleri de çekiyor; bu test
// yalnızca sipariş kartını doğruluyor, yönlendirme mock'lanır.
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  usePathname: () => '/orders',
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

const COMPONENTS: BundleComponent[] = [
  {
    key: 'c1',
    orderItemId: 8801,
    title: 'Kemer Detaylı Elbise',
    slug: 'kemer-detayli-elbise',
    imageUrl: '',
    variantName: 'L',
    quantity: 1,
    price: 1250,
  },
  {
    key: 'c2',
    orderItemId: 8802,
    title: 'Kruvaze Ceket',
    slug: 'kruvaze-ceket',
    imageUrl: '',
    variantName: 'M',
    quantity: 1,
    price: 1250,
  },
];

const BUNDLE_PRODUCT: OrderProduct = {
  name: 'Deneme bundle',
  variantName: '',
  image: 'https://cdn/bundle.webp',
  slug: 'deneme-bundle',
  kind: 'normal',
  isBundle: true,
  bundleGroupId: '101703d9',
  bundleComponents: COMPONENTS,
};

const NORMAL_PRODUCT: OrderProduct = {
  name: 'Uzun Kollu Gömlek',
  variantName: 'M',
  image: 'https://cdn/gomlek.webp',
  slug: 'uzun-kollu-gomlek',
  kind: 'normal',
};

function makeOrder(products: OrderProduct[]): Order {
  return {
    id: 5501,
    orderNo: 'HG-5501',
    status: 'Teslim Edildi',
    totalPrice: '2.309,99 TL',
    createdAt: '2026-08-01',
    shipmentCount: 1,
    productCount: products.length,
    receiver: 'Anar M.',
    products,
    isFullyCancelled: false,
  };
}

function renderCard(products: OrderProduct[] = [BUNDLE_PRODUCT], theme?: 'light' | 'dark') {
  const onPressDetails = jest.fn();
  const onPressProduct = jest.fn();

  const utils = renderWithTamagui(
    <OrderCard
      onPressDetails={onPressDetails}
      onPressProduct={onPressProduct}
      order={makeOrder(products)}
    />,
    theme,
  );

  return { ...utils, onPressDetails, onPressProduct };
}

describe('OrderCard — paket ürün', () => {
  it('marks the package line in the orders list', () => {
    renderCard();

    expect(screen.getByText('PAKET')).toBeTruthy();
  });

  it('lists what the package contains', () => {
    renderCard();

    fireEvent.press(screen.getByLabelText('Paket içeriği, 2 ürün'));

    expect(screen.getByText('Kemer Detaylı Elbise')).toBeTruthy();
    expect(screen.getByText('Kruvaze Ceket')).toBeTruthy();
  });

  it('opens a content product from the orders list', () => {
    const { onPressProduct } = renderCard();

    fireEvent.press(screen.getByLabelText('Paket içeriği, 2 ürün'));
    fireEvent.press(screen.getByLabelText('Kruvaze Ceket ürün detayı'));

    expect(onPressProduct).toHaveBeenCalledWith('kruvaze-ceket');
  });

  it('names each package when the order carries more than one', () => {
    renderCard([
      BUNDLE_PRODUCT,
      { ...BUNDLE_PRODUCT, name: 'İkinci paket', bundleGroupId: 'aaa1' },
    ]);

    expect(screen.getByText('Deneme bundle')).toBeTruthy();
    expect(screen.getByText('İkinci paket')).toBeTruthy();
  });

  it('shows no package section for an order without packages', () => {
    renderCard([NORMAL_PRODUCT]);

    expect(screen.queryByText('PAKET')).toBeNull();
    expect(screen.queryByText(/Paket içeriği/)).toBeNull();
  });

  it('keeps the package marker readable in the dark theme', () => {
    renderCard([BUNDLE_PRODUCT], 'dark');

    expect(screen.getByText('PAKET')).toBeTruthy();
  });
});
