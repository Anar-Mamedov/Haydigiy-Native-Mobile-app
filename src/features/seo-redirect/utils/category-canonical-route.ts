import type { CategorySlugIndex, CategorySlugEntry } from '@/types/category-slug-index.types';
import type { WebLocation } from '@/types/seo-redirect.types';
import { WEB_MENU_LISTING_ROOTS, resolveDeepLinkPath } from '@/utils/resolve-deep-link';

/**
 * Kategori listeleri web'de yalnız `/{slug}?c={id}` adresinde yayınlanır. `?c=` içermeyen
 * (`/kadin-elbise`) ya da yanlış slug'lı (`/eski-ad?c=187`) bir adres derin bağlantıyla gelince
 * çözücü onu ürün sanar, ürün API'si 404 döner. Bu yardımcı, web middleware'indeki 301'in kuralını
 * (frontend `src/lib/seo/categoryCanonicalRedirect.ts`) uygulamada aynen uygular.
 */

const SINGLE_SEGMENT_PATH = /^\/([a-z0-9-]+)$/i;
/** Web ile aynı: ürün linkleri de best sıralaması için `?c=` taşır; böyle bir slug kategori sayılmaz. */
const PRODUCT_SLUG_PATTERN = /^[a-z0-9-]+\d+(?:-\d+)?$/i;

function readSlug(path: string): string | null {
  const match = path.match(SINGLE_SEGMENT_PATH);
  return match ? match[1] : null;
}

/** Hermes'te `URLSearchParams` güvenilmez; sorgu dizesi elle ayrıştırılır (bkz. resolve-deep-link). */
function splitQuery(queryString: string): string[] {
  return queryString.split('&').filter(Boolean);
}

function readCategoryId(pairs: string[]): string | null {
  const pair = pairs.find((item) => item.split('=')[0] === 'c');
  return pair ? (pair.split('=')[1] ?? '') : null;
}

/** Kategori indeksine bakmaya değecek bir yol mu (tek parçalı, menü listesi değil). */
export function isCategoryCandidatePath(path: string): boolean {
  const slug = readSlug(path);
  return slug !== null && !WEB_MENU_LISTING_ROOTS.has(slug.toLowerCase());
}

function findTarget(slug: string, categoryId: string | null, index: CategorySlugIndex): CategorySlugEntry | null {
  if (categoryId === null) {
    return index.bySlug.get(slug) ?? null;
  }

  const category = index.byId.get(Number(categoryId));
  if (!category || category.slug === slug) return null;
  if (PRODUCT_SLUG_PATTERN.test(slug)) return null;
  return category;
}

/**
 * Adres bir kategoriye karşılık geliyorsa o kategorinin uygulama rotası
 * (`/kategori/{slug}?c={id}`, diğer sorgu parametreleri korunur); değilse `null`.
 */
export function findCategoryCanonicalRoute(location: WebLocation, index: CategorySlugIndex): string | null {
  if (!isCategoryCandidatePath(location.path)) return null;

  const slug = readSlug(location.path) as string;
  const pairs = splitQuery(location.queryString);
  const target = findTarget(slug, readCategoryId(pairs), index);
  if (!target) return null;

  const query = [`c=${target.id}`, ...pairs.filter((item) => item.split('=')[0] !== 'c')].join('&');
  return resolveDeepLinkPath(`/${target.slug}?${query}`);
}
