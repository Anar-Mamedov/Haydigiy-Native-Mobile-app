import {
  mapAvailableFilters,
  mapPopularProductDto,
  mapProductDetailDto,
  mapSizeMeasurements,
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

  it('maps feature icon assets, descriptions and backend colors', () => {
    const product = mapSearchProductDto({
      ...baseProductDto,
      feature_icons: [
        {
          id: 20,
          name: 'Peşin Fiyatına 3 Taksit',
          slug: 'pesin-fiyatina-3-taksit',
          description: 'Peşin Fiyatına 3 Taksit',
          description_bg_color: '#FF8800',
          asset_url: 'https://cdn.example.com/tags/installment.png',
          position_hint: 'center',
          display_order: 3,
          sort_order: 4,
          pivot: {
            display_order: 2,
            position: null,
          },
        },
      ],
    });

    expect(product.featureIcons?.[0]).toMatchObject({
      id: 20,
      description: 'Peşin Fiyatına 3 Taksit',
      descriptionBgColor: '#FF8800',
      assetUrl: 'https://cdn.example.com/tags/installment.png',
      displayOrder: 2,
      sortOrder: 4,
    });
  });
});

describe('mapPopularProductDto', () => {
  it('maps popular product DTOs into the mobile search card model', () => {
    expect(
      mapPopularProductDto({
        id: 89651,
        name: 'Penye Tasli Tisort Siyah',
        slug: 'penye-tasli-tisort-siyah-75201701',
        image: 'https://cdn.example.com/product.webp',
        price: 129.99,
      }),
    ).toEqual({
      id: '89651',
      name: 'Penye Tasli Tisort Siyah',
      slug: 'penye-tasli-tisort-siyah-75201701',
      imageUrl: 'https://cdn.example.com/product.webp',
      price: 129.99,
    });
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

  it('maps detail feature icon colors and asset paths', () => {
    const product = mapProductDetailDto({
      id: 80872,
      name: 'Keten Gorunumlu Etek Pantolon Siyah',
      slug: 'keten-gorunumlu-etek-pantolon-siyah-80872',
      price: 219.99,
      feature_icons: [
        {
          id: 15,
          name: 'Butik Kontrol',
          slug: 'butik-kontrol',
          description: null,
          description_bg_color: '#FF8800',
          asset_url: 'https://cdn.example.com/tags/butik.png',
          display_order: 1,
        },
      ],
    });

    expect(product.featureIcons?.[0]).toMatchObject({
      id: 15,
      assetUrl: 'https://cdn.example.com/tags/butik.png',
      description: null,
      descriptionBgColor: '#FF8800',
      displayOrder: 1,
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
      product_categories: [
        { id: 70, name: 'İndirim', slug: 'indirim', menu_status: 1, product_count: 9, parent_id: null },
        { id: 71, name: 'Gizli İndirim', slug: 'gizli-indirim', menu_status: 0, product_count: 3, parent_id: null },
      ],
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

  it('keeps only product categories whose menu_status is one', () => {
    const result = mapAvailableFilters({
      product_categories: [
        { id: 1, name: 'Görünür', slug: 'gorunur', menu_status: 1 },
        { id: 2, name: 'String Görünür', slug: 'string-gorunur', menu_status: '1' },
        { id: 3, name: 'Gizli', slug: 'gizli', menu_status: 0 },
        { id: 4, name: 'Durumu Yok', slug: 'durumu-yok' },
      ],
    });

    expect(result.productCategories.map((category) => category.id)).toEqual([1, 2]);
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

describe('mapSizeMeasurements', () => {
  it('returns an empty list when the field is missing or malformed', () => {
    expect(mapSizeMeasurements(undefined)).toEqual([]);
    expect(mapSizeMeasurements(null)).toEqual([]);
    expect(mapSizeMeasurements([])).toEqual([]);
  });

  // Gerçek yanıtta ölçünün adı `parent_name`, değeri `value` alanında geliyor.
  it('maps the backend shape to the domain model', () => {
    expect(
      mapSizeMeasurements([
        {
          variant_id: 148299,
          size_id: 234,
          size_name: 'S',
          barcode: '17745161',
          properties: [
            { property_id: 498, parent_name: 'Genişlik', property_name: '36 cm', value: '36 cm' },
            {
              property_id: 2630,
              parent_name: 'Kumaş İçeriği',
              property_name: '%95 Viskon %5 Likra',
              value: '%95 Viskon %5 Likra',
            },
          ],
        },
      ]),
    ).toEqual([
      {
        sizeName: 'S',
        measurements: [
          { key: '498', name: 'Genişlik', value: '36 cm' },
          { key: '2630', name: 'Kumaş İçeriği', value: '%95 Viskon %5 Likra' },
        ],
      },
    ]);
  });

  it('falls back to property_name when parent_name or value is missing', () => {
    expect(
      mapSizeMeasurements([
        { size_name: 'M', properties: [{ property_id: 45, property_name: 'Göğüs (cm)' }] },
      ]),
    ).toEqual([
      { sizeName: 'M', measurements: [{ key: '45', name: 'Göğüs (cm)', value: 'Göğüs (cm)' }] },
    ]);
  });

  it('keys a measurement by its name when the backend sends no property_id', () => {
    expect(
      mapSizeMeasurements([{ size_name: 'L', properties: [{ parent_name: 'Bel', value: '76 cm' }] }]),
    ).toEqual([{ sizeName: 'L', measurements: [{ key: 'Bel', name: 'Bel', value: '76 cm' }] }]);
  });

  // Ölçüsüz beden ekranda boş satır oluşturmamalı.
  it('drops sizes whose measurements are empty or unusable', () => {
    expect(
      mapSizeMeasurements([
        { size_name: 'S', properties: [] },
        { size_name: 'M', properties: [{ property_id: 45, parent_name: '  ', value: '  ' }] },
        { size_name: 'L', properties: [{ property_id: 45, parent_name: 'Bel', value: '76 cm' }] },
      ]),
    ).toEqual([{ sizeName: 'L', measurements: [{ key: '45', name: 'Bel', value: '76 cm' }] }]);
  });

  it('reaches the product detail model', () => {
    const product = mapProductDetailDto({
      id: 1,
      name: 'Test',
      slug: 'test',
      price: '49.99',
      size_measurements: [
        { size_name: 'S', properties: [{ property_id: 498, parent_name: 'Genişlik', value: '36 cm' }] },
      ],
    });

    expect(product.sizeMeasurements).toEqual([
      { sizeName: 'S', measurements: [{ key: '498', name: 'Genişlik', value: '36 cm' }] },
    ]);
  });
});
