import { buildProductDetailRoute } from '@/features/product/utils/product-detail-route';
import { BlogRelatedProduct } from '../types/blog.types';

/**
 * Backend'in biçimli fiyat metnini sayıya çevirir: "1.249,99 TL" → 1249.99.
 * Virgül yoksa nokta ondalık sayılır ("349.99"); çözülemezse 0 döner ve ürün
 * detayı önizlemesi fiyatı detay isteğinden alır.
 */
export function parseBlogPrice(label: string | number | null | undefined): number {
  if (typeof label === 'number') return Number.isFinite(label) ? label : 0;

  const raw = (label ?? '').replace(/[^\d.,]/g, '');
  if (!raw) return 0;

  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : /^\d+\.\d{1,2}$/.test(raw)
      ? raw
      : raw.replace(/\./g, '');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Web ürün adresinden (`https://haydigiy.com/{slug}` veya `/product/{slug}`)
 * ürün slug'ını çıkarır; uygulamanın ürün rotası bu slug'la açılır.
 */
export function productSlugFromUrl(url: string | null | undefined): string {
  const withoutHost = (url ?? '').trim().replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, '');
  const path = withoutHost.split(/[?#]/)[0] ?? '';
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? '';
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

/** Yazıdaki ürün kartından ürün detayını önizlemeyle açan rota. */
export function buildBlogProductRoute(product: BlogRelatedProduct) {
  return buildProductDetailRoute({
    id: product.id,
    imageUrl: product.imageUrl ?? '',
    price: product.price,
    slug: product.slug,
    title: product.name,
  });
}
