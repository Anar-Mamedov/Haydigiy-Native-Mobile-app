import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getApiErrorMessage } from '@/features/checkout/utils/error-message';
import { OrderMergeOffer } from '@/types/order-merge.types';
import { useOrderMergeOfferLoader } from '../api/order-merge.queries';
import {
  useMergeCartIntoCodOrderMutation,
  usePrepareCardMergeMutation,
} from '../api/order-merge.mutations';
import { ORDER_MERGE_FALLBACK_TEXTS } from '../api/order-merge.mapper';
import {
  ORDER_MERGE_PAYMENT_PATH,
  toOrderMergePaymentParams,
} from '../utils/order-merge-payment-params';

type Options = {
  /** The normal checkout ("Yeni Sipariş Olarak Devam Et"). */
  onContinueAsNewOrder: () => void;
};

export interface OrderMergeOfferController {
  /** Last offer; kept while the sheet animates closed. */
  offer: OrderMergeOffer | null;
  isOpen: boolean;
  /** Eligibility request in flight (the cart's confirm button shows its spinner). */
  isChecking: boolean;
  isSubmitting: boolean;
  /** Opens the offer when there is a mergeable order; resolves `false` to continue normally. */
  offerIfEligible: () => Promise<boolean>;
  accept: () => void;
  continueAsNewOrder: () => void;
  dismiss: () => void;
}

/**
 * "Mevcut siparişime ekle" flow of the cart:
 * - cash on delivery → `merge-cod`, the order detail opens with the backend message;
 * - card → `merge-card-prepare`, the card step opens for the difference;
 * - "Yeni Sipariş Olarak Devam Et" → the normal checkout, no merge request.
 * Failures (stock, order already in the warehouse) are shown and the user stays in the cart.
 */
export function useOrderMergeOffer({ onContinueAsNewOrder }: Options): OrderMergeOfferController {
  const router = useRouter();
  const loadOffer = useOrderMergeOfferLoader();
  const codMerge = useMergeCartIntoCodOrderMutation();
  const cardMerge = usePrepareCardMergeMutation();

  const [offer, setOffer] = useState<OrderMergeOffer | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  /** A double tap must not merge the cart twice. */
  const inFlightRef = useRef(false);

  const offerIfEligible = useCallback(async () => {
    setIsChecking(true);
    try {
      const next = await loadOffer();
      if (!next) return false;
      setOffer(next);
      setIsOpen(true);
      return true;
    } catch {
      // The offer is optional: if the check fails the customer checks out as usual.
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [loadOffer]);

  const accept = useCallback(async () => {
    if (!offer || inFlightRef.current) return;
    inFlightRef.current = true;
    const target = { orderId: offer.orderId, orderNo: offer.orderNo };

    try {
      if (offer.paymentKind === 'cod') {
        const result = await codMerge.mutateAsync(target);
        setIsOpen(false);
        router.push(`/order/${offer.orderId}` as never);
        Alert.alert('Başarılı', result.message);
        return;
      }

      const session = await cardMerge.mutateAsync(target);
      setIsOpen(false);
      router.push({
        pathname: ORDER_MERGE_PAYMENT_PATH,
        params: toOrderMergePaymentParams(session),
      } as never);
    } catch (error) {
      setIsOpen(false);
      const fallback =
        offer.paymentKind === 'cod'
          ? ORDER_MERGE_FALLBACK_TEXTS.codFailed
          : ORDER_MERGE_FALLBACK_TEXTS.cardPrepareFailed;
      Alert.alert('Hata', getApiErrorMessage(error, fallback));
    } finally {
      inFlightRef.current = false;
    }
  }, [cardMerge, codMerge, offer, router]);

  const continueAsNewOrder = useCallback(() => {
    if (inFlightRef.current) return;
    setIsOpen(false);
    onContinueAsNewOrder();
  }, [onContinueAsNewOrder]);

  const dismiss = useCallback(() => {
    if (inFlightRef.current) return;
    setIsOpen(false);
  }, []);

  return {
    offer,
    isOpen,
    isChecking,
    isSubmitting: codMerge.isPending || cardMerge.isPending,
    offerIfEligible,
    accept: () => void accept(),
    continueAsNewOrder,
    dismiss,
  };
}
