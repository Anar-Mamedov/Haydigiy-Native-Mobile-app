import { useMutation } from '@tanstack/react-query';
import {
  AvailableDatesParams,
  cancelHepsijetDelivery,
  getHepsijetAvailableDates,
  HepsijetSendPayload,
  sendHepsijetDelivery,
} from '@/services/hepsijet.service';

/** Fetches bookable pickup days on demand (button press), like the web flow. */
export function useHepsijetAvailableDatesMutation() {
  return useMutation({
    mutationFn: (params: AvailableDatesParams) => getHepsijetAvailableDates(params),
  });
}

/** Creates a scheduled return (home pickup) delivery. */
export function useSendHepsijetDeliveryMutation() {
  return useMutation({
    mutationFn: (payload: HepsijetSendPayload) => sendHepsijetDelivery(payload),
  });
}

/** Cancels a scheduled return (home pickup) delivery (rollback on failure). */
export function useCancelHepsijetDeliveryMutation() {
  return useMutation({
    mutationFn: (deliveryNo: string) => cancelHepsijetDelivery(deliveryNo),
  });
}
