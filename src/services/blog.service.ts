import { blogApiClient } from '@/lib/blog-api-client';
import { isMissingResourceApiError } from '@/utils/api-error';

/**
 * Blog API yanıtları alan adlarını tutarlı vermiyor (`cover_image`/`mainImage`,
 * `publishedAt`/`published_at` ...). DTO'lar bu yüzden gevşek tutulur; hangi
 * alanın tercih edileceğine mapper karar verir (web `normalizePost` ile aynı).
 */
export interface BlogCategoryDto {
  id?: number | string | null;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  [key: string]: unknown;
}

export interface BlogRelatedProductDto {
  id?: number | string | null;
  name?: string | null;
  title?: string | null;
  price?: string | number | null;
  url?: string | null;
  image?: string | null;
}

export interface BlogFaqDto {
  question?: string | null;
  answer?: string | null;
}

export interface BlogPostDto {
  id?: number | string | null;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  summary?: string | null;
  content?: string | null;
  answer_summary?: string | null;
  answerSummary?: string | null;
  tldr?: string | null;
  cover_image?: string | null;
  mainImage?: string | null;
  coverImage?: string | null;
  cover_image_alt?: string | null;
  coverImageAlt?: string | null;
  is_featured?: boolean | number | string | null;
  isFeatured?: boolean | number | string | null;
  is_pinned?: boolean | number | string | null;
  isPinned?: boolean | number | string | null;
  publishedAt?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  category?: BlogCategoryDto | null;
  categories?: (string | number | BlogCategoryDto)[] | null;
  tags?: (string | number | BlogCategoryDto)[] | null;
  faqs?: BlogFaqDto[] | null;
  relatedProducts?: BlogRelatedProductDto[] | null;
  related_products?: BlogRelatedProductDto[] | null;
  [key: string]: unknown;
}

export interface BlogPaginationDto {
  current_page?: number | string | null;
  last_page?: number | string | null;
  per_page?: number | string | null;
  total?: number | string | null;
}

export interface BlogPostListResponseDto {
  data?: BlogPostDto[] | null;
  pagination?: BlogPaginationDto | null;
}

export interface BlogPostListParams {
  page: number;
  /** Kategori sayfası için API'nin beklediği `category_slug`; tüm yazılarda `null`. */
  categorySlug?: string | null;
}

/** Liste isteğinin sorgu parametreleri; web yalnızca yayımlanmış yazıları ister. */
export function buildBlogPostListQuery({ page, categorySlug }: BlogPostListParams) {
  const slug = categorySlug?.trim();
  return {
    status: 'published',
    page,
    ...(slug ? { category_slug: slug } : {}),
  };
}

/** Yayımlanmış blog yazılarının bir sayfası (`GET /blog/posts`). */
export async function getBlogPostsDto(params: BlogPostListParams): Promise<BlogPostListResponseDto> {
  const response = await blogApiClient.get<BlogPostListResponseDto>('/blog/posts', {
    params: buildBlogPostListQuery(params),
  });
  return response.data ?? {};
}

/**
 * Tek bir blog yazısı (`GET /blog/posts/{slug}`). API bulunamayan yazı için 404
 * döndüğünde `null` verilir; ekran bunu hata değil "yazı yok" durumu olarak gösterir.
 */
export async function getBlogPostDto(slug: string): Promise<BlogPostDto | null> {
  try {
    const response = await blogApiClient.get<{ data?: BlogPostDto | null }>(
      `/blog/posts/${encodeURIComponent(slug)}`,
    );
    return response.data?.data ?? null;
  } catch (error) {
    if (isMissingResourceApiError(error)) return null;
    throw error;
  }
}

/** Aktif blog kategorileri (`GET /blog/categories`). */
export async function getBlogCategoriesDto(): Promise<BlogCategoryDto[]> {
  const response = await blogApiClient.get<{ data?: BlogCategoryDto[] | null }>('/blog/categories', {
    params: { status: 'active' },
  });
  const categories = response.data?.data;
  return Array.isArray(categories) ? categories : [];
}
