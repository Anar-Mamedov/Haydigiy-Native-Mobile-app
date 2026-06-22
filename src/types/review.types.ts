export type ReviewTabKey = 'pending' | 'waiting' | 'approved';

export type ReviewTab = {
  key: string;
  label: string;
};

/** A delivered product the user can review, or has already reviewed (`GET /review/my`). */
export type UserReview = {
  /** Stable row id (review id when present, otherwise an order/product composite). */
  id: string;
  orderItemId: number;
  orderId: number;
  productId: number;
  variantId: number;
  slug: string;
  productName: string;
  variantName: string;
  productImage: string | null;
  deliveredAt: string;
  rating: number | null;
  comment: string | null;
  /** Whether the buyer has already submitted a review for this item. */
  isReviewed: boolean;
};

/**
 * Minimal product reference the review submission sheet needs. Decouples the sheet
 * from any single feature's item type (order line, review list, …).
 */
export type ReviewTarget = {
  id: number;
  productId?: number;
  variantId?: number;
  name: string;
  variantName: string;
  slug: string;
  image: string | null;
  quantity: number;
};
