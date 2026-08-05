import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from './order.keys';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import { submitReviewDto, SubmitReviewPayload } from '@/services/review.service';

/**
 * Submits a product review and refreshes the owning order detail so the item's
 * "Değerlendir" button flips to "Değerlendirildi".
 */
export function useSubmitReviewMutation(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) => submitReviewDto(payload),
    onSuccess: (_data, payload) => {
      // Insider custom eventi: yorum yapan kullanıcı (yorum_yapildi).
      insiderTracker.trackReviewSubmitted({
        productId: payload.productId ? String(payload.productId) : '',
        rating: payload.rating,
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
}
