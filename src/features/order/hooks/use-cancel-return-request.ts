import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { orderKeys } from '../api/order.keys';
import { cancelReturnRequestDto, getReturnErrorMessage } from '@/services/return.service';
import {
  cancelHepsijetDelivery,
  getHepsijetReturnDeliveryNo,
} from '@/services/hepsijet.service';
import { OrderDetail } from '@/types/order.types';

/**
 * "İade talebini iptal et" akışı — web sipariş detayının 1:1 portu: iade
 * randevulu (Hepsijet) oluşturulduysa önce kurye gönderisi iptal edilir,
 * başarılıysa iade talebi silinir ve sipariş detayı tazelenir.
 */
export function useCancelReturnRequest(order: OrderDetail | null) {
  const queryClient = useQueryClient();
  const [isCanceling, setIsCanceling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const cancelReturn = useCallback(
    async (returnRequestId: number) => {
      if (!order || isCanceling) return;
      setIsCanceling(true);
      setErrorMessage(null);
      try {
        if (order.hasHepsijetReturn && order.orderNo) {
          const hepsijetResult = await cancelHepsijetDelivery(
            getHepsijetReturnDeliveryNo(order.orderNo),
          );
          if (!hepsijetResult?.success) {
            setErrorMessage(
              hepsijetResult?.message || 'Randevulu iade gönderisi iptal edilemedi.',
            );
            return;
          }
        }

        const result = await cancelReturnRequestDto(returnRequestId);
        setSuccessMessage(
          result.message ||
            'İade talebiniz iptal edildi. Yeni bir iade talebi oluşturabilirsiniz.',
        );
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(String(order.id)) });
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      } catch (error) {
        setErrorMessage(getReturnErrorMessage(error, 'İade talebi iptal edilemedi.'));
      } finally {
        setIsCanceling(false);
      }
    },
    [order, isCanceling, queryClient],
  );

  return {
    cancelReturn,
    isCanceling,
    errorMessage,
    clearError: useCallback(() => setErrorMessage(null), []),
    successMessage,
    clearSuccess: useCallback(() => setSuccessMessage(null), []),
  };
}
