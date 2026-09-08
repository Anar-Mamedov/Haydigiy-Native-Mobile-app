import { MyReviewEntriesResponseDto, MyReviewEntryDto, MyReviewsResponseDto, ReviewItemDto } from './review.dtos';
import { ReviewTab, ReviewTabKey, UserReview } from '@/types/review.types';
import { ActivityPage, MyReviewEntry } from '@/types/account-activity.types';
import {
  mapActivityPagination,
  mapActivityProduct,
  readActivityCount,
  readActivityNumber,
  readActivityString,
} from '@/utils/account-activity';

const DEFAULT_TABS: ReviewTab[] = [
  { key: 'pending', label: 'Değerlendir' },
  { key: 'waiting', label: 'Onay Bekleyenler' },
  { key: 'approved', label: 'Onaylananlar' },
];

function toNumberOrNull(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapReviewItem(dto: ReviewItemDto): UserReview {
  return {
    id: String(dto.review_id ?? `${dto.order_item_id}-${dto.product_id}-${dto.variant_id}`),
    orderItemId: dto.order_item_id,
    orderId: dto.order_id,
    productId: dto.product_id,
    variantId: dto.variant_id,
    slug: dto.slug,
    productName: dto.product_name,
    variantName: dto.variant_name?.trim() || '',
    productImage: dto.product_image || null,
    deliveredAt: dto.delivered_at || '',
    rating: toNumberOrNull(dto.review?.rating),
    comment: dto.review?.comment?.trim() || null,
    isReviewed: Boolean(dto.product_review),
  };
}

export type MappedReviews = {
  items: UserReview[];
  tabs: ReviewTab[];
};

/**
 * Maps the `/review/my` response to domain reviews. On the "pending" tab, already
 * reviewed items are dropped (matching the web) so they don't reappear after submit.
 */
export function mapMyReviews(
  response: MyReviewsResponseDto | null | undefined,
  tab: ReviewTabKey,
): MappedReviews {
  const items = (response?.data ?? []).map(mapReviewItem);
  const visibleItems = tab === 'pending' ? items.filter((item) => !item.isReviewed) : items;

  return {
    items: visibleItems,
    tabs: response?.tabs?.length ? response.tabs : DEFAULT_TABS,
  };
}

/**
 * `GET /review/my-reviews` sayfasını modele çevirir. Kimliksiz kayıt listeye
 * alınmaz; `thumbnail` yoksa tam boy fotoğrafa düşülür ki kartta görsel boş
 * kalmasın.
 */
export function mapMyReviewEntry(dto: MyReviewEntryDto): MyReviewEntry | null {
  const id = readActivityNumber(dto?.id);
  if (id === null) return null;

  const rating = readActivityNumber(dto.rating) ?? 0;
  const thumbnail = readActivityString(dto.thumbnail);
  const photo = readActivityString(dto.photo);
  const status = readActivityString(dto.status).toLowerCase();

  return {
    id,
    rating: Math.min(5, Math.max(0, rating)),
    comment: readActivityString(dto.comment),
    status: status === 'approved' || status === 'rejected' ? status : 'pending',
    createdAt: readActivityString(dto.created_at),
    likeCount: readActivityCount(dto.like_count),
    size: readActivityString(dto.size),
    height: readActivityNumber(dto.height),
    weight: readActivityNumber(dto.weight),
    thumbnail: thumbnail || photo || null,
    photo: photo || thumbnail || null,
    orderId: readActivityNumber(dto.order_id),
    product: mapActivityProduct(dto.product),
  };
}

export function mapMyReviewEntriesPage(dto: MyReviewEntriesResponseDto | null | undefined): ActivityPage<MyReviewEntry> {
  const items = (Array.isArray(dto?.data) ? dto.data : [])
    .map(mapMyReviewEntry)
    .filter((entry): entry is MyReviewEntry => entry !== null);

  return { items, pagination: mapActivityPagination(dto?.meta, items.length) };
}
