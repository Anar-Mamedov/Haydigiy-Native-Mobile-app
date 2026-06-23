import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentKeys } from './payment.keys';
import {
  addPaymentMethodDto,
  deletePaymentMethodDto,
  PaymentMethodInput,
  updatePaymentMethodDto,
} from '@/services/payment.service';

/** Adds a new refund IBAN and refreshes the saved-IBAN list. */
export function useAddPaymentMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentMethodInput) => addPaymentMethodDto(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

/** Updates an existing refund IBAN and refreshes the saved-IBAN list. */
export function useUpdatePaymentMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PaymentMethodInput }) =>
      updatePaymentMethodDto(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

/** Deletes a refund IBAN and refreshes the saved-IBAN list. */
export function useDeletePaymentMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePaymentMethodDto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}
