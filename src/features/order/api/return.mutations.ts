import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from './order.keys';
import { returnKeys } from './return.keys';
import {
  recreateReturnAsPttDto,
  submitReturnRequestDto,
  SubmitReturnRequestPayload,
} from '@/services/return.service';
import { addPaymentMethodDto } from '@/services/payment.service';
import { addAddressDto, NewAddressInput } from '@/services/address.service';

/** Submits a return request and refreshes the affected order detail + lists. */
export function useSubmitReturnRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitReturnRequestPayload) => submitReturnRequestDto(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(String(payload.orderId)) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

/** Re-creates a failed Hepsijet return as a PTT return (fallback path). */
export function useRecreateReturnAsPttMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      returnRequestId,
      payload,
    }: {
      returnRequestId: number | null;
      payload: SubmitReturnRequestPayload;
    }) => recreateReturnAsPttDto(returnRequestId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(String(variables.payload.orderId)),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

/** Adds a new refund IBAN and refreshes the saved-IBAN list. */
export function useAddPaymentMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { iban: string; ibanName: string; isDefault?: boolean }) =>
      addPaymentMethodDto(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: returnKeys.paymentMethods() });
    },
  });
}

/** Creates a new pickup address and refreshes the saved-address list. */
export function useAddAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewAddressInput) => addAddressDto(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: returnKeys.addresses() });
    },
  });
}
