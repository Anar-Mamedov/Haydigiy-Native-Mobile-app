import { mapMyReviews } from './review.mapper';
import { ReviewItemDto } from './review.dtos';

const makeDto = (overrides: Partial<ReviewItemDto> = {}): ReviewItemDto => ({
  order_item_id: 10,
  order_id: 5,
  product_id: 100,
  variant_id: 200,
  slug: 'urun',
  product_name: 'Ürün',
  variant_name: 'M',
  product_image: 'img.jpg',
  delivered_at: '2026-01-01',
  review: null,
  product_review: false,
  ...overrides,
});

describe('mapMyReviews', () => {
  it('maps DTO fields and coerces the rating', () => {
    const { items } = mapMyReviews(
      { data: [makeDto({ review_id: 7, review: { rating: '4', comment: ' iyi ' } })] },
      'approved',
    );

    expect(items[0]).toMatchObject({
      id: '7',
      orderItemId: 10,
      orderId: 5,
      productId: 100,
      variantId: 200,
      slug: 'urun',
      productName: 'Ürün',
      variantName: 'M',
      rating: 4,
      comment: 'iyi',
      isReviewed: false,
    });
  });

  it('drops already-reviewed items on the pending tab', () => {
    const result = mapMyReviews(
      {
        data: [
          makeDto({ order_item_id: 1, product_review: false }),
          makeDto({ order_item_id: 2, product_review: true }),
        ],
      },
      'pending',
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].orderItemId).toBe(1);
  });

  it('keeps reviewed items on non-pending tabs', () => {
    const result = mapMyReviews(
      { data: [makeDto({ product_review: true })] },
      'approved',
    );
    expect(result.items).toHaveLength(1);
  });

  it('falls back to default tabs and an empty list for missing payloads', () => {
    const result = mapMyReviews(undefined, 'pending');
    expect(result.items).toEqual([]);
    expect(result.tabs.map((t) => t.key)).toEqual(['pending', 'waiting', 'approved']);
  });
});
