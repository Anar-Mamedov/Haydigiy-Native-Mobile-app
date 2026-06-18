import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from './order.keys';
import { mapCancelPreview, toCancelItemPayload } from './order-cancel.mapper';
import { previewOrderCancelDto, submitOrderCancelDto } from '@/services/order.service';
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

/** Submits a cancellation and refreshes the order detail + lists. */
export function useSubmitOrderCancelMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { message?: string },
    unknown,
    { id: string; items: CancelItem[]; acknowledged?: boolean }
  >({
    mutationFn: ({ id, items, acknowledged }) =>
      submitOrderCancelDto(id, items.map(toCancelItemPayload), acknowledged),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
