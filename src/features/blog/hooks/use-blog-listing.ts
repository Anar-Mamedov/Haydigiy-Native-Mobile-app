import { useMemo, useState } from 'react';
import { useBlogCategoriesQuery, useBlogPostsInfiniteQuery } from '../api/blog.queries';
import { BLOG_ALL_CATEGORIES_KEY, BLOG_TEXTS } from '../constants/blog-ui';
import { blogCategoryApiSlug, blogCategoryTitleFromParam, findBlogCategory } from '../utils/blog-category';
import { buildBlogFeedItems } from '../utils/blog-feed';

/**
 * Blog liste ekranının durumu: kategoriler, seçili kategori, sayfalı yazılar ve
 * web düzenine göre hazırlanmış akış.
 *
 * Kategori sekmesi değişince yeni ekran açılmaz; aynı ekranın filtresi değişir.
 * Kategori rotası (`/blog/kategori/{slug}`) yalnızca başlangıç seçimini verir.
 * Web adresindeki slug kategori adından üretildiği için (`kazak-triko`) yazılar,
 * kategori listesiyle eşlenip API'nin kendi slug'ı (`kazak`) bulunduktan sonra istenir.
 */
export function useBlogListing(initialCategory?: string) {
  const [categoryParam, setCategoryParam] = useState<string | null>(initialCategory?.trim() || null);
  const categoriesQuery = useBlogCategoriesQuery();
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const activeCategory = categoryParam ? findBlogCategory(categoryParam, categories) : null;
  const apiSlug = categoryParam ? blogCategoryApiSlug(categoryParam, categories) : null;
  // Kategori listesi gelene kadar beklemek, web slug'ıyla boş sonuç alıp sonra
  // gerçek slug'la ikinci istek atmayı önler. Liste hata verirse slug olduğu gibi denenir.
  const postsQuery = useBlogPostsInfiniteQuery(apiSlug, !categoryParam || !categoriesQuery.isPending);

  const items = useMemo(
    () => buildBlogFeedItems(postsQuery.data?.pages.flatMap((page) => page.posts) ?? []),
    [postsQuery.data],
  );

  const loadMore = () => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage && !postsQuery.isFetchNextPageError) {
      postsQuery.fetchNextPage();
    }
  };

  const refresh = () => {
    categoriesQuery.refetch();
    postsQuery.refetch();
  };

  return {
    activeKey: activeCategory?.slug ?? categoryParam ?? BLOG_ALL_CATEGORIES_KEY,
    categories,
    items,
    loadMore,
    postsQuery,
    refresh,
    selectCategory: setCategoryParam,
    title: categoryParam ? blogCategoryTitleFromParam(categoryParam, categories) : BLOG_TEXTS.listingTitle,
  };
}
