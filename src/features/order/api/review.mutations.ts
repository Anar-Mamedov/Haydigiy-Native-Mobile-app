import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from './order.keys';
import { submitReviewDto, SubmitReviewPayload } from '@/services/review.service';

/**
 * Submits a product review and refreshes the owning order detail so the item's
 * "Değerlendir" button flips to "Değerlendirildi".
 */
export function useSubmitReviewMutation(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) => submitReviewDto(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
}
