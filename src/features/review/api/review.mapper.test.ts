import { mapMyReviewEntriesPage, mapMyReviews } from './review.mapper';
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

describe('mapMyReviewEntriesPage', () => {
  it('maps the user\'s own review with its photo and body info', () => {
    const page = mapMyReviewEntriesPage({
      data: [
        {
          id: 9021,
          rating: 5,
          comment: 'Kumaşı çok güzel...',
          status: 'approved',
          created_at: '05.09.2026',
          like_count: 4,
          height: 165,
          weight: 58,
          size: 'M',
          photo: 'https://cdn/full.jpg',
          thumbnail: 'https://cdn/thumb.jpg',
          order_id: 1365460,
          product: { id: 8891, name: 'Test Ürün', slug: 'test-urun', image: 'https://cdn/p.jpg' },
        },
      ],
      meta: { current_page: 1, last_page: 3, total: 24, per_page: 10 },
    });

    expect(page.items[0]).toEqual({
      id: 9021,
      rating: 5,
      comment: 'Kumaşı çok güzel...',
      status: 'approved',
      createdAt: '05.09.2026',
      likeCount: 4,
      size: 'M',
      height: 165,
      weight: 58,
      thumbnail: 'https://cdn/thumb.jpg',
      photo: 'https://cdn/full.jpg',
      orderId: 1365460,
      product: { id: 8891, name: 'Test Ürün', slug: 'test-urun', image: 'https://cdn/p.jpg' },
    });
    expect(page.pagination).toEqual({ currentPage: 1, lastPage: 3, total: 24, perPage: 10 });
  });

  it('falls back to the full photo when no thumbnail is sent', () => {
    const page = mapMyReviewEntriesPage({ data: [{ id: 7, rating: 5, status: 'approved', photo: 'https://cdn/only.jpg' }] });

    expect(page.items[0].thumbnail).toBe('https://cdn/only.jpg');
  });

  it('survives a review with no photo and no body info', () => {
    const page = mapMyReviewEntriesPage({ data: [{ id: 5, rating: '4', status: 'pending' }] });

    expect(page.items[0]).toMatchObject({
      rating: 4,
      status: 'pending',
      thumbnail: null,
      photo: null,
      size: '',
      height: null,
      weight: null,
      likeCount: 0,
      product: null,
    });
  });

  it('clamps the rating to 0-5', () => {
    const page = mapMyReviewEntriesPage({
      data: [
        { id: 1, rating: 9, status: 'approved' },
        { id: 2, rating: -3, status: 'approved' },
      ],
    });

    expect(page.items[0].rating).toBe(5);
    expect(page.items[1].rating).toBe(0);
  });

  it('treats an unknown status as pending and assumes a single page without meta', () => {
    const page = mapMyReviewEntriesPage({ data: [{ id: 1, status: 'wat' }] });

    expect(page.items[0].status).toBe('pending');
    expect(page.pagination).toEqual({ currentPage: 1, lastPage: 1, total: 1, perPage: 1 });
  });

  it('degrades to an empty list on a malformed payload and drops idless records', () => {
    for (const payload of [null, undefined, {}, { data: null }] as const) {
      expect(mapMyReviewEntriesPage(payload as never).items).toEqual([]);
    }
    expect(mapMyReviewEntriesPage({ data: [{ rating: 5 }] }).items).toHaveLength(0);
  });
});
