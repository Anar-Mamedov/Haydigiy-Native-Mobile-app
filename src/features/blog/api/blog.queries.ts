import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getBlogCategoriesDto, getBlogPostDto, getBlogPostsDto } from '@/services/blog.service';
import { BlogCategory, BlogPost } from '../types/blog.types';
import { blogKeys } from './blog.keys';
import { mapBlogCategories, mapBlogPost, mapBlogPostPage } from './blog.mapper';

// Web blog sayfaları 30 sn (yazılar) / 60 sn (kategoriler) yeniden doğrulanıyor;
// uygulama içi gezinmede gereksiz istek atmamak için biraz daha uzun tutulur.
const BLOG_POSTS_STALE_TIME = 60_000;
const BLOG_CATEGORIES_STALE_TIME = 5 * 60_000;

/**
 * Yayımlanmış blog yazıları (`GET /blog/posts`), sonsuz kaydırmayla. Kategori
 * sayfası API'nin `category_slug` filtresini kullanır; `null` tüm yazılardır.
 */
export function useBlogPostsInfiniteQuery(categorySlug: string | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: blogKeys.list(categorySlug),
    enabled,
    staleTime: BLOG_POSTS_STALE_TIME,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      mapBlogPostPage(await getBlogPostsDto({ page: pageParam, categorySlug })),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.lastPage ? lastPage.currentPage + 1 : undefined,
  });
}

/** Tek blog yazısı (`GET /blog/posts/{slug}`); bulunamazsa `null`. */
export function useBlogPostQuery(slug: string) {
  return useQuery<BlogPost | null>({
    queryKey: blogKeys.detail(slug),
    enabled: slug.length > 0,
    staleTime: BLOG_POSTS_STALE_TIME,
    queryFn: async () => {
      const dto = await getBlogPostDto(slug);
      return dto ? mapBlogPost(dto) : null;
    },
  });
}

/** Aktif blog kategorileri (`GET /blog/categories`); sekmeler ve kategori başlığı için. */
export function useBlogCategoriesQuery() {
  return useQuery<BlogCategory[]>({
    queryKey: blogKeys.categories(),
    staleTime: BLOG_CATEGORIES_STALE_TIME,
    queryFn: async () => mapBlogCategories(await getBlogCategoriesDto()),
  });
}
