import { BlogCategory } from '../types/blog.types';
import { slugifyBlogCategory } from './blog-slug';

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Rota parametresini bilinen bir kategoriye eşler.
 *
 * Web kategori adresini kategori adından üretir (`Kazak/Triko` → `kazak-triko`),
 * API ise kendi `slug` alanıyla (`kazak`) filtreler. Web'den gelen bağlantı da
 * uygulama içi sekme de aynı kategoriye düşsün diye ikisi de denenir.
 */
export function findBlogCategory(param: string, categories: BlogCategory[]): BlogCategory | null {
  const decoded = safeDecode(param).trim();
  if (!decoded) return null;

  const normalized = slugifyBlogCategory(decoded);
  return (
    categories.find((category) => category.slug === decoded) ??
    categories.find(
      (category) =>
        slugifyBlogCategory(category.slug) === normalized ||
        slugifyBlogCategory(category.title) === normalized,
    ) ??
    null
  );
}

/**
 * Kategori bulunamadığında web gibi slug'dan okunur bir başlık üretir
 * (`ev-giyim` → `ev giyim`).
 */
export function blogCategoryTitleFromParam(param: string, categories: BlogCategory[]): string {
  return findBlogCategory(param, categories)?.title ?? safeDecode(param).replace(/-/g, ' ');
}

/** API filtresine gidecek slug: eşleşen kategorinin kendi slug'ı, yoksa gelen değer. */
export function blogCategoryApiSlug(param: string, categories: BlogCategory[]): string {
  return findBlogCategory(param, categories)?.slug ?? safeDecode(param).trim();
}
