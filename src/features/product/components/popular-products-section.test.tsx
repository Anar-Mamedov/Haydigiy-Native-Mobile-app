import type { ComponentProps } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTamagui } from '@/test/render-with-tamagui';
import { PopularProduct } from '@/types/product.types';
import { PopularProductsSection } from './popular-products-section';

const products: PopularProduct[] = [
  {
    id: '89651',
    name: 'Penye Tasli Tisort Siyah',
    slug: 'penye-tasli-tisort-siyah-75201701',
    imageUrl: 'https://cdn.example.com/product.webp',
    price: 129.99,
  },
];

const renderSection = (overrides: Partial<ComponentProps<typeof PopularProductsSection>> = {}) => {
  const props: ComponentProps<typeof PopularProductsSection> = {
    isEmpty: false,
    isError: false,
    isLoading: false,
    onProductPress: jest.fn(),
    onRetry: jest.fn(),
    products,
    ...overrides,
  };

  renderWithTamagui(<PopularProductsSection {...props} />);
  return props;
};

describe('PopularProductsSection', () => {
  it('renders popular product cards and opens the selected product', () => {
    const props = renderSection();

    expect(screen.getByText('Popüler Ürünler')).toBeTruthy();
    expect(screen.getByText('Penye Tasli Tisort Siyah')).toBeTruthy();
    expect(screen.getByText('₺129,99')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Popüler ürünü aç: Penye Tasli Tisort Siyah'));

    expect(props.onProductPress).toHaveBeenCalledWith(products[0]);
  });

  it('renders the loading skeleton', () => {
    renderSection({ isLoading: true, products: [] });

    expect(screen.getByText('Popüler Ürünler')).toBeTruthy();
    expect(screen.getAllByLabelText('Popüler ürün yükleniyor')).toHaveLength(3);
  });

  it('renders an error state with retry action', () => {
    const props = renderSection({ isError: true, products: [] });

    expect(screen.getByText('Popüler ürünler yüklenemedi.')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Popüler ürünleri tekrar dene'));

    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders an empty state', () => {
    renderSection({ isEmpty: true, products: [] });

    expect(screen.getByText('Popüler ürün bulunamadı.')).toBeTruthy();
  });
});
