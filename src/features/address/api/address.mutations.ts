import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressKeys } from './address.keys';
import {
  addAddressDto,
  deleteAddressDto,
  NewAddressInput,
  updateAddressDto,
} from '@/services/address.service';

/** Creates a new address and refreshes the saved-address list. */
export function useAddAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewAddressInput) => addAddressDto(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
}

/** Updates an existing address and refreshes its detail + the list. */
export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: NewAddressInput }) =>
      updateAddressDto(id, input),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: addressKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: addressKeys.detail(id) }),
      ]);
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
