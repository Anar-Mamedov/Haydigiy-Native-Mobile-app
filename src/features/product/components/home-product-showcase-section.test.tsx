import type { ComponentProps } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductShowcase } from '../api/product-showcase.mapper';
import { HomeProductShowcaseSection } from './home-product-showcase-section';

const mockToggleFavorite = jest.fn();

jest.mock('@/features/favorite/api/favorite.queries', () => ({
  useFavoriteToggle: (productId: string | undefined) => ({
    isFavorite: productId === '2',
    isPending: false,
    toggleFavorite: () => mockToggleFavorite(productId),
  }),
}));

const showcase: ProductShowcase = {
  ctaLabel: '',
  ctaLink: '',
  subtitle: '',
  title: 'Öne Çıkanlar',
  products: [
    {
      hasDiscount: false,
      id: '1',
      imageUrl: 'https://cdn.example.com/pantolon.webp',
      price: 219.99,
      slug: 'dabil-bagcikli-pantolon',
      title: 'Dabıl Bağcıklı Pantolon',
    },
    {
      discountRate: 25,
      firstPrice: 200,
      hasDiscount: true,
      id: '2',
      imageUrl: null,
      price: 150,
      slug: 'tullu-tayt',
      title: 'Tüllü Tayt',
    },
  ],
};

const renderSection = (overrides: Partial<ComponentProps<typeof HomeProductShowcaseSection>> = {}) => {
  const props: ComponentProps<typeof HomeProductShowcaseSection> = {
    onAddToCartPress: jest.fn(),
    onCtaPress: jest.fn(),
    onProductPress: jest.fn(),
    showcase,
    ...overrides,
  };

  renderWithTamagui(<HomeProductShowcaseSection {...props} />);
  return props;
};

beforeEach(() => {
  mockToggleFavorite.mockClear();
});

describe('HomeProductShowcaseSection', () => {
  it('renders the title, every product and its price', () => {
    renderSection();

    expect(screen.getByText('Öne Çıkanlar')).toBeTruthy();
    expect(screen.getByText('Dabıl Bağcıklı Pantolon')).toBeTruthy();
    expect(screen.getByText('219,99 TL')).toBeTruthy();
    expect(screen.getByText('-%25')).toBeTruthy();
    expect(screen.getByText('150,00 TL')).toBeTruthy();
    expect(screen.getByText('200,00 TL')).toBeTruthy();
    expect(screen.getAllByText('SEPETE EKLE')).toHaveLength(2);
  });

  it('opens the product and starts the quick add for the pressed card', () => {
    const props = renderSection();

    fireEvent.press(screen.getByLabelText('Ürün detayını aç: Tüllü Tayt'));
    fireEvent.press(screen.getByLabelText('Sepete ekle: Dabıl Bağcıklı Pantolon'));

    expect(props.onProductPress).toHaveBeenCalledWith(showcase.products[1]);
    expect(props.onAddToCartPress).toHaveBeenCalledWith(showcase.products[0]);
  });

  it('toggles the favorite of the pressed card and reflects its state', () => {
    renderSection();

    expect(screen.getByLabelText('Tüllü Tayt favorilerden çıkar')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Dabıl Bağcıklı Pantolon favorilere ekle'));

    expect(mockToggleFavorite).toHaveBeenCalledWith('1');
  });

  it('hides the favorite button for a product without a numeric id', () => {
    renderSection({
      showcase: { ...showcase, products: [{ ...showcase.products[0], id: '' }] },
    });

    expect(screen.queryByLabelText('Dabıl Bağcıklı Pantolon favorilere ekle')).toBeNull();
  });

  it('shows the call to action only when both its label and link exist', () => {
    const props = renderSection({
      showcase: { ...showcase, ctaLabel: 'Tümünü Gör', ctaLink: '/one-cikanlar?c=207' },
    });

    fireEvent.press(screen.getByLabelText('Öne Çıkanlar: Tümünü Gör'));
    expect(props.onCtaPress).toHaveBeenCalledTimes(1);
  });

  it('renders nothing without products', () => {
    renderSection({ showcase: { ...showcase, products: [] } });

    expect(screen.queryByTestId('home-product-showcase')).toBeNull();
  });

  it('keeps titles and actions readable in dark mode', () => {
    renderWithTamagui(
      <HomeProductShowcaseSection
        onAddToCartPress={jest.fn()}
        onCtaPress={jest.fn()}
        onProductPress={jest.fn()}
        showcase={showcase}
      />,
      'dark',
    );

    expect(screen.getByText('Öne Çıkanlar')).toBeTruthy();
    expect(screen.getAllByText('SEPETE EKLE')).toHaveLength(2);
  });
});
