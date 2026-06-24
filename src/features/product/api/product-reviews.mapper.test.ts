import { mapProductReviewPage } from './product-reviews.mapper';

describe('mapProductReviewPage', () => {
  it('maps summary, filters and masks reviewer names', () => {
    const result = mapProductReviewPage({
      product: {
        id: 5,
        name: 'Pijama Şort',
        price: '29,99',
        media: { medium: 'http://img/p.jpg' },
        cart_count: 2600,
        favorites_count: 432,
        total_quantity: 3,
      },
      review_summary: { average: 4.2, total: 10, stars: { 1: 1, 2: 0, 3: 1, 4: 3, 5: 5 }, with_photos: 2 },
      filters: { sizes: ['S', 'M'], heights: ['170'], weights: ['60'] },
      reviews: {
        data: [
          {
            id: 1,
            user_name: 'Cansu Sarp',
            rating: 5,
            comment: 'Çok beğendim',
            photo: 'http://img/1.jpg',
            created_at: '2026-05-20T00:00:00Z',
            height: 170,
            weight: 60,
            size: 'M',
            like_count: 3,
          },
        ],
      },
    });

    expect(result.product).toEqual({
      id: '5',
      name: 'Pijama Şort',
      imageUrl: 'http://img/p.jpg',
      price: '29,99',
      cartCount: 2600,
      favoritesCount: 432,
      totalQuantity: 3,
      variants: [],
    });
    expect(result.summary).toEqual({
      average: 4.2,
      total: 10,
      stars: { 1: 1, 2: 0, 3: 1, 4: 3, 5: 5 },
      withPhotos: 2,
    });
    expect(result.filterValues.sizes).toEqual(['S', 'M']);
    expect(result.reviews[0]).toMatchObject({
      id: '1',
      userName: 'C***u S**p',
      rating: 5,
      comment: 'Çok beğendim',
      photo: 'http://img/1.jpg',
      size: 'M',
      likeCount: 3,
    });
  });

  it('falls back to empty summary/filters/reviews when absent', () => {
    const result = mapProductReviewPage({});
    expect(result.summary.total).toBe(0);
    expect(result.summary.stars[5]).toBe(0);
    expect(result.filterValues.sizes).toEqual([]);
    expect(result.reviews).toEqual([]);
  });
});
