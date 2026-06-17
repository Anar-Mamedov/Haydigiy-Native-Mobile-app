import { useMutation } from '@tanstack/react-query';
import { getAddressesDto } from '@/services/address.service';
import { extractOrderToken, prepareOrderDto } from '@/services/order.service';

export type CheckoutPreparation =
  | { status: 'no_address' }
  | { status: 'ready'; orderToken: string | null };

/**
 * Prepares checkout from the current cart: verifies the user has a delivery
 * address, then asks the backend to prepare the order (`/order/prepare`).
 * Returns a discriminated result the caller turns into navigation/UI, keeping
 * this remote flow inside a TanStack mutation instead of inline service calls.
 */
export function useCheckoutMutation() {
  return useMutation<CheckoutPreparation>({
    mutationFn: async () => {
      const addresses = await getAddressesDto();
      if (addresses.length === 0) {
        return { status: 'no_address' };
      }

      const prepared = await prepareOrderDto();
      return { status: 'ready', orderToken: extractOrderToken(prepared) };
    },
  });
}
