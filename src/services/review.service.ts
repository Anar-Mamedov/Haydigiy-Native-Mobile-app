import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { MyReviewsResponseDto } from '@/features/review/api/review.dtos';
import { ReviewTabKey } from '@/types/review.types';

export type ReviewPhoto = { uri: string; name: string; type: string };

/** The current user's reviewable / reviewed products for a tab (`GET /review/my`). */
export async function getMyReviewsDto(tab: ReviewTabKey): Promise<MyReviewsResponseDto> {
  if (!appEnv.apiBaseUrl) return { data: [], tabs: [] };

  const response = await apiClient.get<MyReviewsResponseDto>('/review/my', {
    params: { tab },
    headers: { Accept: 'application/json' },
  });
  return response.data;
}

export interface SubmitReviewPayload {
  productId: number;
  variantId: number;
  rating: number;
  comment: string;
  height?: string;
  weight?: string;
  photo?: ReviewPhoto | null;
  orderItemId?: number;
  orderId?: number | string;
}

/**
 * Submits a product review (`POST /review`) as multipart form data, mirroring the
 * web review modal (rating, comment, optional height/weight/photo + order refs).
 */
export async function submitReviewDto(payload: SubmitReviewPayload): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  const form = new FormData();
  form.append('product_id', String(payload.productId));
  form.append('variant_id', String(payload.variantId));
  form.append('rating', String(payload.rating));
  form.append('comment', payload.comment);
  if (payload.height) form.append('height', payload.height);
  if (payload.weight) form.append('weight', payload.weight);
  if (payload.orderItemId) form.append('order_item_id', String(payload.orderItemId));
  if (payload.orderId != null) form.append('order_id', String(payload.orderId));
  if (payload.photo) {
    // React Native multipart file part.
    form.append('photo', {
      uri: payload.photo.uri,
      name: payload.photo.name,
      type: payload.photo.type,
    } as unknown as Blob);
  }

  await apiClient.post('/review', form, { headers: { 'Content-Type': 'multipart/form-data' } });
}

/**
 * Resolves a variant id from a product slug + variant name when the order item
 * does not already carry one (same fallback as the web review modal).
 */
export async function resolveReviewVariantId(
  slug: string,
  variantName: string,
): Promise<{ productId: number; variantId: number } | null> {
  if (!appEnv.apiBaseUrl || !slug) return null;

  try {
    const response = await apiClient.get(`/product/${slug}`);
    const data = response.data as {
      id?: number;
      variants?: { id?: number; name?: string; pivot?: { id?: number } | null }[];
    };
    const productId = Number(data?.id ?? 0);
    const target = (variantName || '').trim();
    const match = (data?.variants ?? []).find((v) => (v?.name || '').trim() === target);
    const variantId = Number(match?.pivot?.id ?? match?.id ?? 0);
    if (!variantId) return null;
    return { productId, variantId };
  } catch {
    return null;
  }
}
