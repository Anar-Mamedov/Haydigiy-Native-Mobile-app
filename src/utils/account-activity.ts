import { ActivityPagination, ActivityProduct } from '@/types/account-activity.types';

/**
 * `GET /review/my-reviews` ve `GET /question/my` yanıtlarının paylaşılan
 * parçaları: ürün özeti, sayfalama ve alan okuma yardımcıları.
 *
 * İki uç aynı sözleşmeyi kullandığı için bu kurallar tek yerde durur; entity'ye
 * özel eşleme her özelliğin kendi `api/*.mapper.ts` dosyasındadır.
 *
 * Web tarafındaki `src/lib/accountActivity.ts` ile aynı davranır ki iki platform
 * aynı kaydı aynı şekilde göstersin.
 */

export interface ActivityMetaDto {
  current_page?: number | string | null;
  last_page?: number | string | null;
  total?: number | string | null;
  per_page?: number | string | null;
}

export interface ActivityProductDto {
  id?: number | string | null;
  name?: string | null;
  slug?: string | null;
  image?: string | null;
}

export function readActivityString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

export function readActivityNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Beğeni/adet gibi sayaçlar: negatif ve geçersiz değerler 0 sayılır. */
export function readActivityCount(value: unknown): number {
  const parsed = readActivityNumber(value);
  return parsed !== null && parsed > 0 ? Math.floor(parsed) : 0;
}

function readPositiveInt(value: unknown, fallback: number): number {
  const parsed = readActivityNumber(value);
  return parsed !== null && parsed >= 1 ? Math.floor(parsed) : fallback;
}

/** Ürünü silinmiş kayıtlarda `product` boş gelir; kart o zaman ürünsüz çizilir. */
export function mapActivityProduct(dto: ActivityProductDto | null | undefined): ActivityProduct | null {
  if (!dto) return null;

  const name = readActivityString(dto.name);
  const slug = readActivityString(dto.slug);
  if (!name && !slug) return null;

  return {
    id: readActivityNumber(dto.id),
    name,
    slug,
    image: readActivityString(dto.image) || null,
  };
}

/** `meta` gelmezse tek sayfalık liste varsayılır; sonsuz kaydırma boşa sayfa istemesin. */
export function mapActivityPagination(dto: ActivityMetaDto | null | undefined, itemCount: number): ActivityPagination {
  return {
    currentPage: readPositiveInt(dto?.current_page, 1),
    lastPage: readPositiveInt(dto?.last_page, 1),
    total: readActivityCount(dto?.total) || itemCount,
    perPage: readPositiveInt(dto?.per_page, itemCount > 0 ? itemCount : 10),
  };
}
