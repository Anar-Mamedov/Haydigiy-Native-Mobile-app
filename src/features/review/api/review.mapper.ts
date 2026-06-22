import { MyReviewsResponseDto, ReviewItemDto } from './review.dtos';
import { ReviewTab, ReviewTabKey, UserReview } from '@/types/review.types';

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
