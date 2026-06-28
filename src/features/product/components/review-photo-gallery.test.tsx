/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductReviewItem, ReviewProduct } from '../api/product-reviews.mapper';
import { ReviewPhotoGallery } from './review-photo-gallery';

jest.mock('./product-image-gallery-modal', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    ProductImageGalleryModal: ({ images, initialIndex, open }: any) =>
      open
        ? React.createElement(
            View,
            { testID: 'product-image-gallery-modal' },
            React.createElement(Text, null, `${initialIndex + 1} / ${images.length}`),
          )
        : null,
  };
});

const photos: ProductReviewItem[] = [
  {
    id: '1',
    userName: 'C***u S**p',
    rating: 5,
    comment: 'Cok begendim',
    photo: 'https://cdn.example.com/review-1.webp',
    createdAt: '2026-05-20T00:00:00Z',
    size: 'M',
    height: 170,
    weight: 60,
    likeCount: 3,
  },
  {
    id: '2',
    userName: 'A***e K**a',
    rating: 4,
    comment: 'Kalibi tam oturdu',
    photo: 'https://cdn.example.com/review-2.webp',
    createdAt: '2026-05-21T00:00:00Z',
    size: null,
    height: null,
    weight: null,
    likeCount: 1,
  },
];

const product: ReviewProduct = {
  id: '80872',
  name: 'Spor Gunluk Ayakkabi',
  imageUrl: 'https://cdn.example.com/product.webp',
  price: '219,99',
  cartCount: 12,
  favoritesCount: 5,
  totalQuantity: 8,
  variants: [],
};

describe('ReviewPhotoGallery', () => {
  it('renders the frontend-style review photo modal details', () => {
    renderWithTamagui(
      <ReviewPhotoGallery
        initialIndex={0}
        onClose={jest.fn()}
        open
        photos={photos}
        product={product}
      />,
    );

    expect(screen.getByText('C***u S**p')).toBeTruthy();
    expect(screen.getByText('#1')).toBeTruthy();
    expect(screen.getByText('Beden: M')).toBeTruthy();
    expect(screen.getByText('Boy: 170cm')).toBeTruthy();
    expect(screen.getByText('Kilo: 60kg')).toBeTruthy();
    expect(screen.getByText('Cok begendim')).toBeTruthy();
    expect(screen.getByText('Spor Gunluk Ayakkabi')).toBeTruthy();
    expect(screen.getByText('219,99 TL')).toBeTruthy();
  });

  it('navigates between photo reviews and forwards add-to-cart presses', () => {
    const onAddToCartPress = jest.fn();

    renderWithTamagui(
      <ReviewPhotoGallery
        initialIndex={0}
        onAddToCartPress={onAddToCartPress}
        onClose={jest.fn()}
        open
        photos={photos}
        product={product}
      />,
    );

    fireEvent.press(screen.getByLabelText('Sonraki fotograf'));

    expect(screen.getByText('A***e K**a')).toBeTruthy();
    expect(screen.getByText('#2')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Sepete ekle'));

    expect(onAddToCartPress).toHaveBeenCalledTimes(1);
  });

  it('opens the same fullscreen zoom gallery used by product images when the review photo is pressed', () => {
    renderWithTamagui(
      <ReviewPhotoGallery
        initialIndex={0}
        onClose={jest.fn()}
        open
        photos={photos}
        product={product}
      />,
    );

    fireEvent.press(screen.getByLabelText('Degerlendirme fotografini tam ekran ac'));

    expect(screen.getByTestId('product-image-gallery-modal')).toBeTruthy();
  });
});
