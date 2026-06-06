import { fireEvent, screen } from '@testing-library/react-native';
import { ColorVariantsSheet } from './color-variants-sheet';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { Product } from '@/types/product.types';

jest.mock('tamagui', () => {
  const actual = jest.requireActual('tamagui');
  const React = jest.requireActual('react');

  const SheetRoot = function SheetRoot({ children, open }: any) {
    return open ? React.createElement(React.Fragment, null, children) : null;
  };
  SheetRoot.Overlay = function SheetOverlay() {
    return null;
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(actual.YStack, props, children);
  };

  return {
    ...actual,
    Sheet: SheetRoot,
  };
});

const product: Product = {
  brand: 'HaydiGiy',
  category: 'Kadın Alt Giyim',
  currency: 'TRY',
  description: 'Test product description',
  id: 'product-1',
  imageUrl: 'https://example.com/current.png',
  price: 150,
  rating: 4.5,
  reviewCount: 20,
  sellerName: 'HaydiGiy',
  shippingLabel: '',
  slug: 'current-product',
  title: 'Current Product',
  otherColors: [
    {
      id: 'product-1',
      imageUrl: '',
      name: '',
      price: 0,
      slug: '',
    },
    {
      id: 'product-2',
      imageUrl: 'https://example.com/blue.png',
      name: 'Blue Product',
      price: 175,
      slug: 'blue-product',
    },
  ],
};

describe('ColorVariantsSheet', () => {
  it('renders a compact color options sheet with the backend color count', () => {
    renderWithTamagui(
      <ColorVariantsSheet
        open
        onOpenChange={jest.fn()}
        onSelectVariant={jest.fn()}
        product={product}
        selectedVariantId="product-1"
      />,
    );

    expect(screen.getByText('Farklı Renk Seçenekleri (2)')).toBeTruthy();
    expect(screen.getByLabelText('Current Product seçeneğini seç')).toBeTruthy();
    expect(screen.getByLabelText('Blue Product seçeneğini seç')).toBeTruthy();
  });

  it('normalizes the selected current product option before selecting it', () => {
    const onSelectVariant = jest.fn();
    const onOpenChange = jest.fn();

    renderWithTamagui(
      <ColorVariantsSheet
        open
        onOpenChange={onOpenChange}
        onSelectVariant={onSelectVariant}
        product={product}
        selectedVariantId="product-1"
      />,
    );

    fireEvent.press(screen.getByLabelText('Current Product seçeneğini seç'));

    expect(onSelectVariant).toHaveBeenCalledWith({
      id: 'product-1',
      imageUrl: 'https://example.com/current.png',
      name: 'Current Product',
      price: 150,
      slug: 'current-product',
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes from the header button', () => {
    const onOpenChange = jest.fn();

    renderWithTamagui(
      <ColorVariantsSheet
        open
        onOpenChange={onOpenChange}
        onSelectVariant={jest.fn()}
        product={product}
        selectedVariantId="product-1"
      />,
    );

    fireEvent.press(screen.getByLabelText('Renk seçeneklerini kapat'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
