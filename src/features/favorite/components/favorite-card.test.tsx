import { screen } from '@testing-library/react-native';
import { FavoriteCard } from './favorite-card';
import { mapFavoriteItemDto } from '../api/favorite.mapper';
import { FavoriteItemDto } from '../api/favorite.dtos';
import { renderWithTamagui } from '@/test/render-with-tamagui';

function makeFavorite(quantity: number) {
  const dto: FavoriteItemDto = {
    product_id: 1,
    total_favorites: 0,
    product: {
      id: 1,
      name: 'Test Ürün',
      slug: 'test-urun',
      price: 100,
      average_rating: 0,
      reviews_count: 0,
      variants: [{ id: 1, name: 'M', variant_id: 11, quantity }],
    },
  };
  return mapFavoriteItemDto(dto);
}

const handlers = {
  onRemovePress: jest.fn(),
  onAddToCartPress: jest.fn(),
  onOpenSizeSelector: jest.fn(),
  onProductPress: jest.fn(),
  selectedSize: null,
};

function renderCard(quantity: number) {
  return renderWithTamagui(<FavoriteCard favorite={makeFavorite(quantity)} {...handlers} />);
}

describe('FavoriteCard product image', () => {
  beforeEach(() => jest.clearAllMocks());

  // Regression: `blurRadius` made expo-image blur via Glide's RenderScript
  // BlurTransformation, which segfaults in libRSDriver.so on Android 12+ and was
  // the second-largest crash cluster in Play Console. The out-of-stock overlay
  // already conveys the state, so the image must render unblurred either way.
  it.each([
    ['in stock', 5],
    ['out of stock', 0],
  ])('never passes blurRadius to expo-image when %s', (_label, quantity) => {
    renderCard(quantity);

    expect(screen.getByTestId('favorite-card-image').props.blurRadius).toBeUndefined();
  });

  it('still marks out-of-stock products with the overlay label', () => {
    renderCard(0);

    expect(screen.getByText('ÜRÜN TÜKENDİ')).toBeTruthy();
  });

  it('does not show the out-of-stock overlay for available products', () => {
    renderCard(5);

    expect(screen.queryByText('ÜRÜN TÜKENDİ')).toBeNull();
  });
});
