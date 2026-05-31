import { fireEvent, screen } from '@testing-library/react-native';
import { ProductCard } from './product-card';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { Product } from '@/types/product.types';

const product: Product = {
  brand: 'HaydiGiy',
  category: 'Elbise',
  currency: 'TRY',
  description: 'Test product description',
  id: 'product-1',
  imageUrl: 'https://example.com/product.png',
  price: 150,
  rating: 4.5,
  reviewCount: 20,
  sellerName: 'HaydiGiy',
  shippingLabel: '',
  slug: 'test-product',
  title: 'Test Product',
  sizes: [
    { name: 'S', hasStock: true },
    { name: 'M', hasStock: false },
  ],
};

describe('ProductCard', () => {
  it('renders the native mobile card content hierarchy', () => {
    renderWithTamagui(<ProductCard onOpen={jest.fn()} product={product} />);

    expect(screen.getByText('Elbise')).toBeTruthy();
    expect(screen.getByText('Test Product')).toBeTruthy();
    expect(screen.getByText('Kampanya Fiyatı:')).toBeTruthy();
    expect(screen.getByText('150,00 TL')).toBeTruthy();
    expect(screen.getByText('S')).toBeTruthy();
    expect(screen.getByText('M')).toBeTruthy();
  });

  it('opens the product when the card is pressed', () => {
    const onOpen = jest.fn();
    renderWithTamagui(<ProductCard onOpen={onOpen} product={product} />);

    fireEvent.press(screen.getByLabelText('Ürün detayını aç: Test Product'));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('opens the product when the image is pressed', () => {
    const onOpen = jest.fn();
    renderWithTamagui(<ProductCard onOpen={onOpen} product={product} />);

    fireEvent.press(screen.getByLabelText('Test Product ürün görseli'));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('keeps the favorite control accessible after toggling', () => {
    renderWithTamagui(<ProductCard onOpen={jest.fn()} product={product} />);

    fireEvent.press(screen.getByLabelText('Test Product favorilere ekle'));

    expect(screen.getByLabelText('Test Product favorilerden çıkar')).toBeTruthy();
  });

  it('opens product detail instead of an external browser when video is pressed', () => {
    const onOpen = jest.fn();

    renderWithTamagui(
      <ProductCard
        onOpen={onOpen}
        product={{ ...product, videoPath: 'https://example.com/product-video.mp4' }}
      />,
    );

    fireEvent.press(screen.getByLabelText('Test Product videosunu aç'));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('uses the provided in-app video handler when video is pressed', () => {
    const onOpen = jest.fn();
    const onVideoPress = jest.fn();
    const videoProduct = { ...product, videoPath: 'https://example.com/product-video.mp4' };

    renderWithTamagui(
      <ProductCard
        onOpen={onOpen}
        onVideoPress={onVideoPress}
        product={videoProduct}
      />,
    );

    fireEvent.press(screen.getByLabelText('Test Product videosunu aç'));

    expect(onVideoPress).toHaveBeenCalledWith(videoProduct);
    expect(onOpen).not.toHaveBeenCalled();
  });

});
