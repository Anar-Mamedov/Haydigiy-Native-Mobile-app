import { ProductDto, SearchProductsResponseDto, SearchSuggestionsResponseDto } from '@/features/product/api/product.dtos';
import { mockProductDtos } from '@/features/product/data/mock-product-dtos';
import { apiClient } from '@/lib/axios';
import { appEnv, getRequiredApiBaseUrl } from '@/lib/env';
import { sleep } from '@/utils/sleep';

export const productEndpoints = {
  detail: (productId: string) => `/products/${productId}`,
  featured: '/products/featured',
  list: '/products',
};

export async function listFeaturedProductDtos(): Promise<ProductDto[]> {
  if (!appEnv.apiBaseUrl) {
    await sleep(150);
    return mockProductDtos;
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<ProductDto[]>(productEndpoints.featured);
  return response.data;
}

export async function getProductByIdDto(productId: string): Promise<ProductDto> {
  if (!appEnv.apiBaseUrl) {
    await sleep(100);
    const dto = mockProductDtos.find((product) => product.id === productId);

    if (!dto) {
      throw new Error(`Product with id "${productId}" was not found.`);
    }

    return dto;
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<ProductDto>(productEndpoints.detail(productId));
  return response.data;
}

export interface SearchProductsParams {
  c?: string | number;
  q?: string;
  page?: string | number;
  colors?: string;
  price_range?: string;
  min_price?: string;
  max_price?: string;
  sorting?: string;
  variants?: string;
  property_ids?: string;
  product_categories?: string;
}

export async function searchProductDtos(params: SearchProductsParams): Promise<SearchProductsResponseDto> {

  if (!appEnv.apiBaseUrl) {
    await sleep(150);
    let list = [...mockProductDtos];
    if (params.q) {
      const query = String(params.q).toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(query) || p.description_text.toLowerCase().includes(query));
    }
    const searchData = list.map((p) => ({
      id: parseInt(p.id.replace(/\D/g, '')) || 999,
      name: p.title,
      slug: p.slug,
      price: p.price,
      max_price: p.original_price,
      average_rating: p.rating,
      reviews_count: p.review_count,
      image_urls: {
        medium: p.image_url,
        thumb: p.image_url,
        large: p.image_url,
      },
      brand_name: p.brand_name,
      category_names: [p.category_name],
      has_stock: true,
      shipping_label: p.shipping_label,
      badge: p.badge,
      seller_name: p.seller_name,
      description_text: p.description_text,
    }));

    return {
      data: searchData,
      total: searchData.length,
      current_page: 1,
      last_page: 1,
      per_page: 20,
    };
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<SearchProductsResponseDto>('/search-products', {
    params: {
      c: params.c,
      q: params.q,
      page: params.page,
      colors: params.colors,
      price_range: params.price_range,
      min_price: params.min_price,
      max_price: params.max_price,
      sorting: params.sorting,
      variants: params.variants,
      property_ids: params.property_ids,
      product_categories: params.product_categories,
    },
  });

  const raw = response.data;
  let productsData: any[] = [];
  if (Array.isArray(raw.data)) {
    productsData = raw.data;
  } else if (raw.products && Array.isArray((raw.products as any).data)) {
    productsData = (raw.products as any).data;
  } else if (Array.isArray(raw.products)) {
    productsData = raw.products;
  }

  const currentPage = raw.current_page ?? (raw.products as any)?.current_page ?? 1;
  const lastPage = raw.last_page ?? (raw.products as any)?.last_page ?? 1;
  const total = raw.total ?? (raw.products as any)?.total ?? 0;
  const perPage = raw.per_page ?? (raw.products as any)?.per_page ?? 20;

  return {
    data: productsData,
    category: raw.category,
    available_filters: raw.available_filters,
    current_page: currentPage,
    last_page: lastPage,
    total,
    per_page: perPage,
  };
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestionsResponseDto> {
  if (!query.trim()) {
    return { products: [], categories: [] };
  }

  if (!appEnv.apiBaseUrl) {
    await sleep(100);
    const lowercaseQuery = query.toLowerCase();
    const matchedProducts = mockProductDtos
      .filter((p) => p.title.toLowerCase().includes(lowercaseQuery))
      .slice(0, 8)
      .map((p, idx) => ({
        id: idx + 1,
        name: p.title,
        slug: p.slug,
        image: p.image_url,
      }));
    const matchedCategories = [
      { id: 1, name: 'Giyim', slug: 'giyim' },
      { id: 2, name: 'Elbise', slug: 'elbise' },
      { id: 3, name: 'Pantolon', slug: 'pantolon' },
      { id: 4, name: 'Etek', slug: 'etek' },
      { id: 5, name: 'T-shirt', slug: 't-shirt' },
    ].filter((c) => c.name.toLowerCase().includes(lowercaseQuery));

    return {
      products: matchedProducts,
      categories: matchedCategories,
    };
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<SearchSuggestionsResponseDto>('/search/search-suggestions', {
    params: { q: query },
  });
  return response.data;
}

export async function getCurrentSlugById(id: string): Promise<{ success: boolean; slug: string }> {
  if (!appEnv.apiBaseUrl) {
    await sleep(50);
    const mockProduct = mockProductDtos.find((p) => p.id === id) || mockProductDtos[0];
    return { success: true, slug: mockProduct.slug };
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<{ success: boolean; slug: string }>(`/product/by-id/${id}`);
  return response.data;
}

export async function getProductDetailBySlug(slug: string): Promise<any> {
  if (!appEnv.apiBaseUrl) {
    await sleep(150);
    const baseProduct = mockProductDtos.find((p) => p.slug === slug) || mockProductDtos[0];
    
    // Return rich structured mock data matching the connects backend payload
    return {
      id: parseInt(baseProduct.id.replace(/\D/g, '')) || 80321,
      type: 'product',
      name: baseProduct.title + ' Siyah - 80321.2164.',
      category_id: 12,
      brand_id: 1,
      group_id: '80321',
      buybox_id: null,
      color_id: 2,
      supplier_id: 1,
      supplier_code: 'SPL-80321',
      stock_code: '80321.2164.',
      price: String(baseProduct.price),
      cost_price: String(baseProduct.price * 0.7),
      other_price: String(baseProduct.original_price ?? baseProduct.price * 1.3),
      tax_glass: null,
      vat_amount: 10,
      tax_status: 1,
      description: baseProduct.description_text + ' Konforlu ve Şık Tasarım\nVücudu saran ve zarif bir silüet sunan siyah dar paça kot pantolon modelimiz, her anınızda şıklığı garantiliyor. %100 pamuk içeriğiyle gün boyu rahatlık sunan bu tasarım, esnekliği sayesinde hareket özgürlüğünüzü kısıtlamaz. Klasik yüksek bel kot kesimi, modern görünümüyle stilinize zarif bir dokunuş katıyor.',
      backorder_status: 0,
      slug: baseProduct.slug,
      status: 'active',
      is_favorite: true,
      is_stock: true,
      is_approved_for_sale: 1,
      category: {
        id: 12,
        parent_id: 1,
        name: baseProduct.category_name,
        slug: 'giyim',
        parent: [
          { id: 1, parent_id: null, name: 'Ana Sayfa', slug: 'ana-sayfa', parent: [] }
        ]
      },
      medias: [
        {
          id: 1,
          product_id: 80321,
          sort: '1',
          front: 1,
          back: 0,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
          thumb: baseProduct.image_url,
          medium: baseProduct.image_url,
          large: baseProduct.image_url
        },
        {
          id: 2,
          product_id: 80321,
          sort: '2',
          front: 0,
          back: 1,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
          thumb: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80',
          medium: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80',
          large: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80'
        }
      ],
      other_colors: mockProductDtos.slice(0, 3).map((p, idx) => ({
        id: idx + 200,
        group_id: '80321',
        name: p.title,
        slug: p.slug,
        is_favorite: false,
        is_stock: true,
        media: {
          id: idx + 500,
          thumb: p.image_url,
          medium: p.image_url,
          large: p.image_url,
          product_id: idx + 200
        }
      })),
      variants: [
        { id: 36, parent_id: 80321, name: '36', name_2: null, sort: 1, pivot: { product_id: 80321, variant_id: 36, stock_code: '36-code', quantity: '10', id: 360, price: String(baseProduct.price), assortment_quantity: null } },
        { id: 38, parent_id: 80321, name: '38', name_2: null, sort: 2, pivot: { product_id: 80321, variant_id: 38, stock_code: '38-code', quantity: '5', id: 380, price: String(baseProduct.price), assortment_quantity: null } },
        { id: 40, parent_id: 80321, name: '40', name_2: null, sort: 3, pivot: { product_id: 80321, variant_id: 40, stock_code: '40-code', quantity: '8', id: 400, price: String(baseProduct.price), assortment_quantity: null } },
        { id: 42, parent_id: 80321, name: '42', name_2: null, sort: 4, pivot: { product_id: 80321, variant_id: 42, stock_code: '42-code', quantity: '0', id: 420, price: String(baseProduct.price), assortment_quantity: null } },
        { id: 44, parent_id: 80321, name: '44', name_2: null, sort: 5, pivot: { product_id: 80321, variant_id: 44, stock_code: '44-code', quantity: '0', id: 440, price: String(baseProduct.price), assortment_quantity: null } }
      ],
      similar_products: mockProductDtos.slice(0, 4).map((p, idx) => ({
        id: idx + 800,
        name: p.title,
        slug: p.slug,
        price: String(p.price),
        is_stock: true,
        media: {
          id: idx + 900,
          thumb: p.image_url,
          medium: p.image_url,
          large: p.image_url,
          product_id: idx + 800
        }
      })),
      favorites_count: 1000,
      cart_count: 35,
      total_quantity: 23,
      reviews: [
        { id: 1, rating: 5, comment: 'yıkamadım rengi akar mı cabuk solar mı bilmiyorum ama cok beğendim', user: { name: 'C***u', surname: 'S***r' }, created_at: '2026-05-20T00:00:00Z' },
        { id: 2, rating: 4, comment: 'Kalıbı tam oturdu, kumaşı çok kaliteli.', user: { name: 'A***e', surname: 'K***a' }, created_at: '2026-05-18T00:00:00Z' },
        { id: 3, rating: 3, comment: 'Güzel ama bedeni bir tık dar geldi, iade edip büyük alacağım.', user: { name: 'M***e', surname: 'Y***z' }, created_at: '2026-05-15T00:00:00Z' }
      ],
      questions: [
        { id: 1, question: 'Ben 36 beden pantolon aldım olmadı 38 ile değişim yapabilirmiyiz', reply: { reply: 'Merhabalar, 😊 Değişimimiz yoktur, sadece iademiz mevcuttur. 🙏' }, user: { name: 'A**a E**l' }, created_at: '2026-05-19T00:00:00Z' },
        { id: 2, question: 'Stok yenilendiğinde haber verir misiniz çok beğendim almak istiyorum', reply: { reply: 'Merhabalar, 😊 Stok güncellemeleri web sitemiz üzerinden yapılmaktadır. Ürünü favorilerinize ekleyerek stoklara geldiğinde bildirim alabilirsiniz. 🙏' }, user: { name: 'H**a G**i' }, created_at: '2026-05-16T00:00:00Z' },
        { id: 3, question: 'Yüksek bel mi 70kg 167 boy 42beden olurmu', reply: { reply: 'Merhabalar, yüksek beldir. Sizler için L/40 beden uygun olabileceğini öngörmekteyiz fakat vücut özelliklerinize istinaden değişkenlik gösterebilir, sevgilerimizle 🌸' }, user: { name: 'C****n G****r' }, created_at: '2026-05-16T00:00:00Z' }
      ],
      properties: [
        { id: 1, name: 'Dar Paça', parent: { id: 10, name: 'Model' } },
        { id: 2, name: '34 cm', parent: { id: 11, name: 'Bel Yüksekliği' } },
        { id: 3, name: 'Dar', parent: { id: 12, name: 'Kalıp' } },
        { id: 4, name: '%100 Pamuk', parent: { id: 13, name: 'Kumaş İçeriği' } },
        { id: 5, name: '34 cm', parent: { id: 14, name: 'Bel Genişliği' } },
        { id: 6, name: '48 cm', parent: { id: 15, name: 'Basen Genişliği' } }
      ],
      feature_icons: [
        { id: 1, name: 'Hızlı Kargo', slug: 'hizli-kargo', description: 'Bugün sipariş verirsen yarın kargoda', asset_url: '' }
      ],
      video_path: null
    };
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<any>(`/product/${slug}`, {
    params: { p: 1 }
  });
  return response.data;
}

export async function getProductReviews(slug: string): Promise<any> {
  if (!appEnv.apiBaseUrl) {
    await sleep(50);
    return {
      reviews: {
        data: [
          { id: 1, rating: 5, comment: 'yıkamadım rengi akar mı cabuk solar mı bilmiyorum ama cok beğendim', user: { name: 'C***u', surname: 'S***r' }, created_at: '2026-05-20T00:00:00Z' },
          { id: 2, rating: 4, comment: 'Kalıbı tam oturdu, kumaşı çok kaliteli.', user: { name: 'A***e', surname: 'K***a' }, created_at: '2026-05-18T00:00:00Z' },
          { id: 3, rating: 3, comment: 'Güzel ama bedeni bir tık dar geldi, iade edip büyük alacağım.', user: { name: 'M***e', surname: 'Y***z' }, created_at: '2026-05-15T00:00:00Z' }
        ],
        next_page_url: null
      }
    };
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<any>(`/product/${slug}/review`);
  return response.data;
}

export interface ProductReviewFilters {
  star?: number;
  has_photo?: number;
  sort?: string;
  size?: string;
  height?: string;
  weight?: string;
}

/**
 * Full product-review page payload (`GET /product/{slug}/review`): the product,
 * a rating summary, the available filter values and the (filtered/sorted) review
 * list. Mirrors the web `useProductReviews` hook.
 */
export async function getProductReviewPageDto(
  slug: string,
  filters: ProductReviewFilters = {},
): Promise<any> {
  if (!appEnv.apiBaseUrl) {
    await sleep(50);
    return {
      review_summary: { average: 0, total: 0, stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, with_photos: 0 },
      filters: { sizes: [], heights: [], weights: [] },
      reviews: { data: [], next_page_url: null },
    };
  }

  getRequiredApiBaseUrl();
  const params: Record<string, string | number> = {};
  if (filters.star) params.star = filters.star;
  if (filters.has_photo !== undefined && filters.has_photo >= 0) params.has_photo = filters.has_photo;
  if (filters.sort) params.sort = filters.sort;
  if (filters.size) params.size = filters.size;
  if (filters.height) params.height = filters.height;
  if (filters.weight) params.weight = filters.weight;

  const response = await apiClient.get<any>(`/product/${slug}/review`, { params });
  return response.data;
}

/** Product Q&A page payload (`GET /product/{slug}/question?q=`). */
export async function getProductQuestionsDto(slug: string, q = ''): Promise<any> {
  if (!appEnv.apiBaseUrl) {
    await sleep(50);
    return { filters: { tags: [] }, questions: { data: [], next_page_url: null } };
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<any>(`/product/${slug}/question`, { params: { q } });
  return response.data;
}

/** Submits a new product question (`POST /question`). */
export async function askProductQuestionDto(productId: number, question: string): Promise<void> {
  getRequiredApiBaseUrl();
  await apiClient.post('/question', { product_id: productId, question });
}

export async function submitProductFeedback(productId: string, slug: string, value: string): Promise<any> {
  if (!appEnv.apiBaseUrl) {
    await sleep(100);
    return { success: true };
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.post<any>('/product-feedback', {
    product_id: productId,
    product_slug: slug,
    value
  });
  return response.data;
}

export async function calculateSize(height: number, weight: number, gender: string): Promise<any> {
  if (!appEnv.apiBaseUrl) {
    await sleep(150);
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    let recommended_size = 'M';
    if (bmi < 18.5) recommended_size = 'XS';
    else if (bmi < 22) recommended_size = 'S';
    else if (bmi < 25) recommended_size = 'M';
    else if (bmi < 28) recommended_size = 'L';
    else if (bmi < 32) recommended_size = 'XL';
    else recommended_size = 'XXL';

    return {
      status: 'success',
      data: {
        recommended_size,
        bmi,
        description: 'Vücut kitle indeksinize göre hesaplanan beden önerisidir.',
        gender
      }
    };
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<any>('/size-calculator', {
    params: { height, weight, gender }
  });
  return response.data;
}
