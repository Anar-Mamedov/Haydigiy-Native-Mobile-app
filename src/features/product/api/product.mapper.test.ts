import {
  mapAvailableFilters,
  mapProductDetailDto,
  mapSearchProductDto,
  mergeProductDetailReviewPage,
} from './product.mapper';
import { SearchProductDto } from './product.dtos';

const baseProductDto: SearchProductDto = {
  id: 80872,
  name: 'Keten Görünümlü Etek Pantolon Siyah',
  slug: 'keten-gorunumlu-etek-pantolon-siyah-80872',
  price: 149.99,
  average_rating: 5,
  reviews_count: 2,
  image_urls: {
    thumb: 'https://cdn.example.com/storage/products/thumb/current.webp',
    medium: 'https://cdn.example.com/storage/products/medium/current.webp',
    large: 'https://cdn.example.com/storage/products/large/current.webp',
  },
};

describe('mapSearchProductDto', () => {
  it('maps color option images from the same fields used by the frontend mobile list', () => {
    const product = mapSearchProductDto({
      ...baseProductDto,
      other_colors: {
        total_count: 3,
        data: [
          {
            id: 80872,
            name: 'Siyah',
            slug: 'keten-gorunumlu-etek-pantolon-siyah-80872',
            price: '149.99',
            image: {
              medium: 'https://cdn.example.com/storage/products/medium/black.webp',
            },
          },
          {
            id: 80873,
            name: 'Bej',
            slug: 'keten-gorunumlu-etek-pantolon-bej-80873',
            price: '149.99',
            media: {
              path: {
                thumb: 'https://cdn.example.com/storage/products/thumb/beige.webp',
              },
            },
          },
          {
            id: 80874,
            name: 'Lacivert',
            slug: 'keten-gorunumlu-etek-pantolon-lacivert-80874',
            price: '149.99',
            media: {
              large: 'https://cdn.example.com/storage/products/large/navy.webp',
            },
          },
        ],
      },
    });

    expect(product.otherColors).toEqual([
      expect.objectContaining({
        id: '80872',
        imageUrl: 'https://cdn.example.com/storage/products/medium/black.webp',
      }),
      expect.objectContaining({
        id: '80873',
        imageUrl: 'https://cdn.example.com/storage/products/medium/beige.webp',
      }),
      expect.objectContaining({
        id: '80874',
        imageUrl: 'https://cdn.example.com/storage/products/medium/navy.webp',
      }),
    ]);
  });
});

describe('mapProductDetailDto', () => {
  it('maps review photos for the product detail comments carousel', () => {
    const product = mapProductDetailDto({
      id: 80872,
      name: 'Keten Gorunumlu Etek Pantolon Siyah',
      slug: 'keten-gorunumlu-etek-pantolon-siyah-80872',
      price: 219.99,
      reviews: [
        {
          id: 1,
          user_name: 'T***e U***r',
          rating: 3,
          comment: 'Urun gercekten guzel',
          photo: 'https://cdn.example.com/storage/reviews/photo.webp',
          created_at: '2026-05-24T00:00:00Z',
        },
      ],
    });

    expect(product.reviews?.[0]).toMatchObject({
      id: '1',
      rating: 3,
      comment: 'Urun gercekten guzel',
      photo: 'https://cdn.example.com/storage/reviews/photo.webp',
      userName: 'T***e U***r',
      createdAt: '2026-05-24T00:00:00Z',
    });
  });

  it('replaces embedded detail reviews with photo-capable review page data', () => {
    const product = mapProductDetailDto({
      id: 80872,
      name: 'Keten Gorunumlu Etek Pantolon Siyah',
      slug: 'keten-gorunumlu-etek-pantolon-siyah-80872',
      price: 219.99,
      reviews: [
        {
          id: 1,
          user_name: 'T***e U***r',
          rating: 3,
          comment: 'Urun gercekten guzel',
          created_at: '2026-05-24T00:00:00Z',
        },
      ],
    });

    const hydrated = mergeProductDetailReviewPage(product, {
      review_summary: { average: 4.3, total: 3, stars: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1 }, with_photos: 1 },
      reviews: {
        data: [
          {
            id: 1,
            user_name: 'T***e U***r',
            rating: 3,
            comment: 'Urun gercekten guzel',
            photo: 'https://cdn.example.com/storage/reviews/photo.webp',
            created_at: '2026-05-24T00:00:00Z',
            height: null,
            weight: null,
            size: null,
            like_count: null,
          },
        ],
      },
    });

    expect(hydrated.rating).toBe(4.3);
    expect(hydrated.reviewCount).toBe(3);
    expect(hydrated.reviews?.[0].photo).toBe('https://cdn.example.com/storage/reviews/photo.webp');
  });
});

describe('mapAvailableFilters', () => {
  it('maps raw snake_case available_filters into the camelCase domain model', () => {
    const result = mapAvailableFilters({
      colors: [{ id: 1, name: 'Siyah', hex: '#000000', product_count: 12 }],
      variants: [{ id: 10, name: 'M', parent_id: 2, product_count: 4 }],
      properties: [{ id: 21, name: 'Pamuk', parent_id: 20, parent_name: 'Kumaş', product_count: 3 }],
      price_ranges: [{ label: '0 - 100 TL', min: 0, max: 100 }],
      product_categories: [{ id: 70, name: 'İndirim', slug: 'indirim', product_count: 9, parent_id: null }],
      category_children: [{ id: 3, name: 'Çanta', slug: 'canta', parent_id: 1 }],
      use_product_category_filters: true,
    });

    expect(result).toEqual({
      colors: [{ id: 1, name: 'Siyah', hex: '#000000', productCount: 12 }],
      variants: [{ id: 10, name: 'M', parentId: 2, productCount: 4 }],
      properties: [{ id: 21, name: 'Pamuk', parentId: 20, parentName: 'Kumaş', productCount: 3 }],
      priceRanges: [{ label: '0 - 100 TL', min: 0, max: 100 }],
      productCategories: [{ id: 70, name: 'İndirim', slug: 'indirim', productCount: 9, parentId: null }],
      categoryChildren: [{ id: 3, name: 'Çanta', slug: 'canta', productCount: undefined, parentId: 1 }],
      useProductCategoryFilters: true,
    });
  });

  it('returns empty collections and false flag when no filters are provided', () => {
    expect(mapAvailableFilters(undefined)).toEqual({
      colors: [],
      variants: [],
      properties: [],
      priceRanges: [],
      productCategories: [],
      categoryChildren: [],
      useProductCategoryFilters: false,
    });
  });
});
