import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { useVideoPlayer } from 'expo-video';
import { ProductVideoModal } from './product-video-modal';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { Product } from '@/types/product.types';

// expo-video is mocked globally in jest.setup.ts (renders a View with testID "expo-video-view").

const mockProduct: Product = {
  id: '123',
  title: 'Test Product',
  slug: 'test-product-slug',
  imageUrl: 'https://example.com/thumb.jpg',
  brand: 'TestBrand',
  category: 'Giyim',
  currency: 'TRY',
  price: 299.99,
  rating: 4.8,
  reviewCount: 15,
  sellerName: 'HaydiGiy',
  shippingLabel: 'Kargo Bedava',
  description: 'Test description',
  isFavorite: false,
};

const baseProps = {
  open: true,
  onOpenChange: jest.fn(),
  videoUri: 'https://example.com/video.mp4',
  product: mockProduct,
  onPrimaryCta: jest.fn(),
  onToggleFavorite: jest.fn(),
};

describe('ProductVideoModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the video player and product details when open is true', () => {
    renderWithTamagui(<ProductVideoModal {...baseProps} />);

    // Check the expo-video player is rendered
    expect(screen.getByTestId('product-carousel-video')).toBeTruthy();

    // Check product title is displayed
    expect(screen.getByText('Test Product')).toBeTruthy();
  });

  it('does not render when open is false', () => {
    renderWithTamagui(<ProductVideoModal {...baseProps} open={false} />);

    expect(screen.queryByTestId('product-carousel-video')).toBeNull();
    expect(screen.queryByText('Test Product')).toBeNull();
  });

  it('does not create a video player while closed, so visiting a video product stays cheap', () => {
    renderWithTamagui(<ProductVideoModal {...baseProps} open={false} />);

    expect(jest.mocked(useVideoPlayer)).not.toHaveBeenCalled();
  });

  it('calls onOpenChange with false when back button is pressed', () => {
    const onOpenChange = jest.fn();
    renderWithTamagui(<ProductVideoModal {...baseProps} onOpenChange={onOpenChange} />);

    const backButton = screen.getByLabelText('Geri');
    fireEvent.press(backButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onPrimaryCta when sepete ekle button is pressed', () => {
    const onPrimaryCta = jest.fn();
    renderWithTamagui(<ProductVideoModal {...baseProps} onPrimaryCta={onPrimaryCta} />);

    const ctaButton = screen.getByText('Sepete Ekle');
    fireEvent.press(ctaButton);

    expect(onPrimaryCta).toHaveBeenCalledTimes(1);
  });

  it('toggles favorite locally and triggers callback when heart button is pressed', () => {
    const onToggleFavorite = jest.fn();
    renderWithTamagui(<ProductVideoModal {...baseProps} onToggleFavorite={onToggleFavorite} />);

    const heartButton = screen.getByLabelText('Favorilere ekle');
    fireEvent.press(heartButton);

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });
});
