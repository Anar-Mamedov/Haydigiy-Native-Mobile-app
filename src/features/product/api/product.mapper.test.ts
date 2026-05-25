import { mapAvailableFilters, mapSearchProductDto } from './product.mapper';
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
