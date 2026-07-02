import { fireEvent, screen } from '@testing-library/react-native';
import { SimilarProductsSection } from './similar-products-section';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { SimilarProduct } from '@/types/product.types';

const products: SimilarProduct[] = [
  {
    id: 's-1',
    name: 'Benzer Elbise',
    slug: 'benzer-elbise',
    price: 199.9,
    imageUrl: 'https://example.com/s1.png',
    hasStock: true,
  },
  {
    id: 's-2',
    name: 'Stoksuz Elbise',
    slug: 'stoksuz-elbise',
    price: 149.9,
    imageUrl: 'https://example.com/s2.png',
    hasStock: false,
  },
];

describe('SimilarProductsSection', () => {
  it('returns nothing without products', () => {
    const { toJSON } = renderWithTamagui(
      <SimilarProductsSection products={[]} onProductPress={jest.fn()} />,
    );

    expect(toJSON()).toBeNull();
  });

  it('passes the full product to the press handler so the target renders an instant preview', () => {
    const onProductPress = jest.fn();

    renderWithTamagui(<SimilarProductsSection products={products} onProductPress={onProductPress} />);

    fireEvent.press(screen.getByText('Benzer Elbise'));

    expect(onProductPress).toHaveBeenCalledWith(products[0]);
  });

  it('marks out-of-stock similar products', () => {
    renderWithTamagui(<SimilarProductsSection products={products} onProductPress={jest.fn()} />);

    expect(screen.getByText('Tükendi')).toBeTruthy();
  });
});
