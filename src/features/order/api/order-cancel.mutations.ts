import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from './order.keys';
import { mapCancelPreview, toCancelItemPayload } from './order-cancel.mapper';
import {
  isOrderUnderReviewError,
  previewOrderCancelDto,
  submitOrderCancelDto,
} from '@/services/order.service';
import { CancelItem, CancelPreview } from '@/types/order.types';

/** Previews the financial impact of cancelling the given items. */
export function usePreviewOrderCancelMutation() {
  return useMutation<CancelPreview, unknown, { id: string; items: CancelItem[] }>({
    mutationFn: async ({ id, items }) => {
      const dto = await previewOrderCancelDto(id, items.map(toCancelItemPayload));
      return mapCancelPreview(dto);
    },
  });
}

/**
 * Submits a cancellation and refreshes the order detail + lists. A failed cancel that moved the
 * order under review (`order_under_review`) changed its status on the server too, so the cached
 * detail and lists are refreshed in that case as well.
 */
export function useSubmitOrderCancelMutation() {
  const queryClient = useQueryClient();

  const refreshOrder = (id: string) => {
    queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
  };

  return useMutation<
    { message?: string },
    unknown,
    { id: string; items: CancelItem[]; acknowledged?: boolean }
  >({
    mutationFn: ({ id, items, acknowledged }) =>
      submitOrderCancelDto(id, items.map(toCancelItemPayload), acknowledged),
    onSuccess: (_data, variables) => refreshOrder(variables.id),
    onError: (error, variables) => {
      if (isOrderUnderReviewError(error)) refreshOrder(variables.id);
    },
  });
}
