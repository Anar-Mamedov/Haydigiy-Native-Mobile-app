import { mapFavoriteItemDto } from './favorite.mapper';
import { FavoriteItemDto, FavoriteVariantDto } from './favorite.dtos';

function makeDto(variants?: FavoriteVariantDto[]): FavoriteItemDto {
  return {
    product_id: 1,
    total_favorites: 0,
    product: {
      id: 1,
      name: 'Ürün',
      slug: 'urun',
      price: 100,
      average_rating: 0,
      reviews_count: 0,
      variants,
    },
  };
}

describe('mapFavoriteItemDto stock derivation', () => {
  it('marks the product out of stock when every variant quantity is zero', () => {
    const item = mapFavoriteItemDto(
      makeDto([
        { id: 1, name: 'S', variant_id: 11, quantity: 0 },
        { id: 2, name: 'M', variant_id: 12, quantity: '0' },
      ]),
    );

    expect(item.product.hasStock).toBe(false);
  });

  it('marks the product in stock when any variant has remaining quantity', () => {
    const item = mapFavoriteItemDto(
      makeDto([
        { id: 1, name: 'S', variant_id: 11, quantity: 0 },
        { id: 2, name: 'M', variant_id: 12, quantity: 3 },
      ]),
    );

    expect(item.product.hasStock).toBe(true);
    expect(item.product.variants?.find((v) => v.name === 'M')?.hasStock).toBe(true);
    expect(item.product.variants?.find((v) => v.name === 'S')?.hasStock).toBe(false);
  });

  it('falls back to the product flag when no variants are returned', () => {
    expect(mapFavoriteItemDto(makeDto()).product.hasStock).toBe(true);
  });
});
