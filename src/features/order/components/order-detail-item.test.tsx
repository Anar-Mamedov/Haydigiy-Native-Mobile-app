import { fireEvent } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OrderDetailItem } from './order-detail-item';
import { OrderDetailItem as OrderDetailItemModel } from '@/types/order.types';
import { BundleComponent } from '@/types/bundle.types';

const components: BundleComponent[] = [
  {
    key: 'c1',
    orderItemId: 11845555,
    title: 'Kemer Detaylı Yarım Kol Elbise Siyah',
    slug: 'kemer-detayli-yarim-kol-elbise-siyah-525212204',
    imageUrl: 'https://cdn/elbise.webp',
    variantName: 'L',
    quantity: 1,
    price: 1250,
  },
  {
    key: 'c2',
    orderItemId: 11845557,
    title: 'Raşel Kumaş İkili Takım Açıkhaki',
    slug: 'rasel-kumas-ikili-takim-acikhaki-75247801-96763',
    imageUrl: 'https://cdn/rasel.webp',
    variantName: 'L',
    quantity: 1,
    price: 1250,
  },
];

const bundleRow: OrderDetailItemModel = {
  id: 11845555,
  name: 'Deneme bundle',
  variantName: '4 ürün',
  slug: 'deneme-bundle',
  image: 'https://cdn/deneme-bundle.webp',
  quantity: 1,
  price: 5000,
  kind: 'normal',
  isBundle: true,
  bundleGroupId: '101703d9',
  bundleComponents: components,
};

const productRow: OrderDetailItemModel = {
  id: 11845556,
  name: 'Uzun Kollu Cepli Gömlek Siyah',
  variantName: 'STANDART',
  slug: 'uzun-kollu-cepli-gomlek-siyah',
  image: 'https://cdn/gomlek.webp',
  quantity: 1,
  price: 309.99,
  kind: 'normal',
};

describe('OrderDetailItem — bundle satırı', () => {
  it('marks the row as a package and hides the size line (a bundle has no own size)', () => {
    const { getByText, queryByText } = renderWithTamagui(
      <OrderDetailItem item={bundleRow} onPressProduct={jest.fn()} />,
    );

    expect(getByText('PAKET')).toBeTruthy();
    expect(getByText('Deneme bundle')).toBeTruthy();
    expect(getByText('4 ürün')).toBeTruthy();
    expect(queryByText('Beden:')).toBeNull();
  });

  it('lists the package contents under the row', () => {
    const { getByText } = renderWithTamagui(
      <OrderDetailItem item={bundleRow} onPressProduct={jest.fn()} />,
    );

    expect(getByText('Kemer Detaylı Yarım Kol Elbise Siyah')).toBeTruthy();
    expect(getByText('Raşel Kumaş İkili Takım Açıkhaki')).toBeTruthy();
  });

  it('opens a component product when it is tapped', () => {
    const onPressBundleComponent = jest.fn();
    const { getByLabelText } = renderWithTamagui(
      <OrderDetailItem
        item={bundleRow}
        onPressBundleComponent={onPressBundleComponent}
        onPressProduct={jest.fn()}
      />,
    );

    fireEvent.press(getByLabelText('Raşel Kumaş İkili Takım Açıkhaki ürün detayı'));

    expect(onPressBundleComponent).toHaveBeenCalledWith(components[1]);
  });

  it('labels the return action for the whole package', () => {
    const { getByText } = renderWithTamagui(
      <OrderDetailItem
        item={bundleRow}
        onPressProduct={jest.fn()}
        onReturn={jest.fn()}
        returnState="available"
      />,
    );

    expect(getByText('Paketi İade Et')).toBeTruthy();
  });

  it('hides the review action on a package row (reviews are per product)', () => {
    const { queryByText } = renderWithTamagui(
      <OrderDetailItem
        item={bundleRow}
        onPressProduct={jest.fn()}
        onReview={jest.fn()}
        reviewState="available"
      />,
    );

    expect(queryByText('Değerlendir')).toBeNull();
  });
});

describe('OrderDetailItem — normal ürün satırı değişmedi', () => {
  it('still shows the size line and the review action', () => {
    const { getByText, queryByText } = renderWithTamagui(
      <OrderDetailItem
        item={productRow}
        onPressProduct={jest.fn()}
        onReview={jest.fn()}
        reviewState="available"
      />,
    );

    expect(getByText('STANDART')).toBeTruthy();
    expect(getByText('Değerlendir')).toBeTruthy();
    expect(queryByText('PAKET')).toBeNull();
  });

  it('keeps the per-product return label', () => {
    const { getByText } = renderWithTamagui(
      <OrderDetailItem
        item={productRow}
        onPressProduct={jest.fn()}
        onReturn={jest.fn()}
        returnState="available"
      />,
    );

    expect(getByText('Ürünü İade Et')).toBeTruthy();
  });
});
