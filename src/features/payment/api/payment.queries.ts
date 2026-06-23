import { useQuery } from '@tanstack/react-query';
import { paymentKeys } from './payment.keys';
import { mapPaymentMethod } from './payment.mapper';
import { getPaymentMethodsDto } from '@/services/payment.service';
import { PaymentMethod } from '@/types/order.types';

/** Loads the user's saved refund IBANs (`GET /payment-methods`). */
export function usePaymentMethodsQuery(enabled = true) {
  return useQuery<PaymentMethod[]>({
    queryKey: paymentKeys.lists(),
    enabled,
    queryFn: async () => {
      const dtos = await getPaymentMethodsDto();
      return dtos.map(mapPaymentMethod);
    },
  });
}
