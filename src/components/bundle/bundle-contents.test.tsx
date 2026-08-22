import { fireEvent } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { BundleContents } from './bundle-contents';
import { BundleComponent } from '@/types/bundle.types';

const components: BundleComponent[] = [
  {
    key: '11845555',
    orderItemId: 11845555,
    title: 'Kemer Detaylı Yarım Kol Elbise Siyah',
    slug: 'kemer-detayli-yarim-kol-elbise-siyah-525212204',
    imageUrl: 'https://cdn/elbise.webp',
    variantName: 'L',
    quantity: 1,
    price: 1250,
  },
  {
    key: '11845557',
    orderItemId: 11845557,
    title: 'Raşel Kumaş İkili Takım Açıkhaki',
    slug: null,
    imageUrl: 'https://cdn/rasel.webp',
    variantName: 'L',
    quantity: 2,
    price: null,
  },
];

describe('BundleContents', () => {
  it('lists every component with its size and quantity', () => {
    const { getByText } = renderWithTamagui(
      <BundleContents collapsible={false} components={components} />,
    );

    expect(getByText('Kemer Detaylı Yarım Kol Elbise Siyah')).toBeTruthy();
    expect(getByText('Beden: L · Adet: 1')).toBeTruthy();
    expect(getByText('Beden: L · Adet: 2')).toBeTruthy();
  });

  it('opens the product detail when a component is tapped', () => {
    const onPressComponent = jest.fn();
    const { getByLabelText } = renderWithTamagui(
      <BundleContents
        collapsible={false}
        components={components}
        onPressComponent={onPressComponent}
      />,
    );

    fireEvent.press(getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah ürün detayı'));

    expect(onPressComponent).toHaveBeenCalledWith(components[0]);
  });

  it('leaves a component without a slug non-interactive (nowhere to navigate)', () => {
    const onPressComponent = jest.fn();
    const { queryByLabelText } = renderWithTamagui(
      <BundleContents
        collapsible={false}
        components={components}
        onPressComponent={onPressComponent}
      />,
    );

    expect(queryByLabelText('Raşel Kumaş İkili Takım Açıkhaki ürün detayı')).toBeNull();
  });

  it('stays read-only when no press handler is given (cancel/return screens)', () => {
    const { queryByLabelText } = renderWithTamagui(
      <BundleContents collapsible={false} components={components} />,
    );

    expect(queryByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah ürün detayı')).toBeNull();
  });

  it('collapses the list until the header is tapped', () => {
    const { getByLabelText, queryByText } = renderWithTamagui(
      <BundleContents components={components} />,
    );

    expect(queryByText('Kemer Detaylı Yarım Kol Elbise Siyah')).toBeNull();

    fireEvent.press(getByLabelText('Paket içeriği, 2 ürün'));

    expect(queryByText('Kemer Detaylı Yarım Kol Elbise Siyah')).toBeTruthy();
  });

  it('renders nothing when there are no components', () => {
    const { toJSON } = renderWithTamagui(<BundleContents components={[]} />);
    expect(toJSON()).toBeNull();
  });
});
