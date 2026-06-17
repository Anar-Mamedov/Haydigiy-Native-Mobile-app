import { useQuery } from '@tanstack/react-query';
import { shippingKeys } from './shipping.keys';
import { mapShippingEstimateDto } from './shipping.mapper';
import { getShippingEstimateDto } from '@/services/shipping.service';

/** Shipping estimate (`/shipping-estimate`) shown on the cart and product pages. */
export function useShippingEstimateQuery() {
  return useQuery({
    queryKey: shippingKeys.estimate(),
    queryFn: async () => {
      const dto = await getShippingEstimateDto();
      return dto ? mapShippingEstimateDto(dto) : null;
    },
    staleTime: 60_000,
  });
}
