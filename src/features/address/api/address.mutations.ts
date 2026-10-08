import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressKeys } from './address.keys';
import {
  addAddressDto,
  deleteAddressDto,
  NewAddressInput,
  updateAddressDto,
} from '@/services/address.service';

/**
 * Varsayılan adres değişince diğer adreslerin bayrağı da değişir; bu yüzden liste
 * (ödeme ekranı dahil) ve tüm adres detayları birlikte tazelenir.
 */
function invalidateSavedAddresses(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: addressKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: addressKeys.details() }),
  ]);
}

/** Creates a new address and refreshes the saved-address list + details. */
export function useAddAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewAddressInput) => addAddressDto(input),
    onSuccess: async () => {
      await invalidateSavedAddresses(queryClient);
    },
  });
}

/** Updates an existing address and refreshes the list + every detail (default flag). */
export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: NewAddressInput }) =>
      updateAddressDto(id, input),
    onSuccess: async () => {
      await invalidateSavedAddresses(queryClient);
    },
  });
}

/** Deletes an address and refreshes the saved-address list. */
export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddressDto(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
}
