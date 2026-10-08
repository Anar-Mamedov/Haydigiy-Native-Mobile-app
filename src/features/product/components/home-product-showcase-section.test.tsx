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
    onProductPress: jest.fn(),
    onShowcasePress: jest.fn(),
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
    expect(props.onShowcasePress).toHaveBeenCalledTimes(1);
  });

  it('hides the call to action when the label has no link, like the web', () => {
    renderSection({ showcase: { ...showcase, ctaLabel: 'Tümünü Gör', ctaLink: '' } });

    expect(screen.queryByText('Tümünü Gör')).toBeNull();
  });

  describe('vitrin bağlantısı (web 604a15132)', () => {
    const linked: ProductShowcase = { ...showcase, ctaLabel: 'Tümünü Gör', ctaLink: '/one-cikanlar?c=207' };

    it('opens the showcase link when the section background is tapped', () => {
      const props = renderSection({ showcase: linked });

      fireEvent.press(screen.getByTestId('home-product-showcase'));

      expect(props.onShowcasePress).toHaveBeenCalledTimes(1);
    });

    it('opens the showcase link when the header title is tapped', () => {
      const props = renderSection({ showcase: linked });

      fireEvent.press(screen.getByText('Öne Çıkanlar'));

      expect(props.onShowcasePress).toHaveBeenCalledTimes(1);
    });

    it('keeps the card, favorite and add-to-cart actions instead of opening the showcase', () => {
      const props = renderSection({ showcase: linked });

      fireEvent.press(screen.getByLabelText('Ürün detayını aç: Tüllü Tayt'));
      fireEvent.press(screen.getByText('Tüllü Tayt'));
      fireEvent.press(screen.getByLabelText('Sepete ekle: Dabıl Bağcıklı Pantolon'));
      fireEvent.press(screen.getByLabelText('Dabıl Bağcıklı Pantolon favorilere ekle'));

      expect(props.onProductPress).toHaveBeenCalledTimes(2);
      expect(props.onAddToCartPress).toHaveBeenCalledTimes(1);
      expect(mockToggleFavorite).toHaveBeenCalledWith('1');
      expect(props.onShowcasePress).not.toHaveBeenCalled();
    });

    it('lets the product rail claim taps so gaps between cards do not open the showcase', () => {
      renderSection({ showcase: linked });

      expect(screen.getByTestId('home-product-showcase-rail').props.onStartShouldSetResponder()).toBe(true);
    });

    it('announces the title as the link when there is no call-to-action label', () => {
      const props = renderSection({ showcase: { ...linked, ctaLabel: '' } });

      const titleLink = screen.getByRole('link', { name: 'Öne Çıkanlar' });
      fireEvent.press(titleLink);

      expect(props.onShowcasePress).toHaveBeenCalledTimes(1);
    });

    it('keeps a single accessible link for the showcase when the call to action exists', () => {
      renderSection({ showcase: linked });

      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('stays inert without a link', () => {
      const props = renderSection();

      fireEvent.press(screen.getByTestId('home-product-showcase'));
      fireEvent.press(screen.getByText('Öne Çıkanlar'));

      expect(props.onShowcasePress).not.toHaveBeenCalled();
      expect(screen.queryByRole('link')).toBeNull();
    });

    it('keeps the linked showcase readable and tappable in dark mode', () => {
      const onShowcasePress = jest.fn();
      renderWithTamagui(
        <HomeProductShowcaseSection
          onAddToCartPress={jest.fn()}
          onProductPress={jest.fn()}
          onShowcasePress={onShowcasePress}
          showcase={linked}
        />,
        'dark',
      );

      expect(screen.getByText('Tümünü Gör')).toBeTruthy();
      fireEvent.press(screen.getByTestId('home-product-showcase'));
      expect(onShowcasePress).toHaveBeenCalledTimes(1);
    });
  });

  it('renders nothing without products', () => {
    renderSection({ showcase: { ...showcase, products: [] } });

    expect(screen.queryByTestId('home-product-showcase')).toBeNull();
  });

  it('keeps titles and actions readable in dark mode', () => {
    renderWithTamagui(
      <HomeProductShowcaseSection
        onAddToCartPress={jest.fn()}
        onProductPress={jest.fn()}
        onShowcasePress={jest.fn()}
        showcase={showcase}
      />,
      'dark',
    );

    expect(screen.getByText('Öne Çıkanlar')).toBeTruthy();
    expect(screen.getAllByText('SEPETE EKLE')).toHaveLength(2);
  });
});
