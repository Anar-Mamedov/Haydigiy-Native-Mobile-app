import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useGoToCartAfterAdd } from '@/features/cart/hooks/use-go-to-cart-after-add';
import { ReorderConfirmation, ReorderResult } from '@/types/order.types';
import { getApiErrorMessage } from '@/utils/api-error';
import { useReorderMutation } from '../api/order-reorder.mutations';
import { REORDER_FALLBACK_MESSAGES } from '../api/order-reorder.mapper';

/**
 * Owns the "Siparişi Tekrarla" flow of the order detail screen:
 * 1. everything in stock → added to the cart, success alert with "Sepete Git";
 * 2. some lines sold out → confirmation sheet; "Evet" re-sends with `confirmed`;
 * 3. nothing in stock or the request failed → error alert with the backend message.
 */
export function useReorderController(orderId: string) {
  const goToCart = useGoToCartAfterAdd();
  const { mutateAsync, isPending, variables } = useReorderMutation();
  const [confirmation, setConfirmation] = useState<ReorderConfirmation | null>(null);
  /**
   * Sheet görünürlüğü veriden ayrı tutulur: kapanırken liste kapanma animasyonu
   * boyunca ekranda kalır, boş bir sheet aşağı kaymaz.
   */
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  /** Çift dokunuşta ikinci istek gitmez; aksi halde ürünler sepete iki kez eklenirdi. */
  const inFlightRef = useRef(false);

  const showError = useCallback((message: string) => {
    setConfirmationOpen(false);
    Alert.alert('Hata', message);
  }, []);

  const handleResult = useCallback(
    (result: ReorderResult) => {
      switch (result.kind) {
        case 'added':
          setConfirmationOpen(false);
          Alert.alert('Başarılı', result.message, [
            { style: 'cancel', text: 'Alışverişe Devam Et' },
            { onPress: goToCart, text: 'Sepete Git' },
          ]);
          return;
        case 'needsConfirmation':
          setConfirmation(result);
          setConfirmationOpen(true);
          return;
        default:
          showError(result.message);
      }
    },
    [goToCart, showError],
  );

  const send = useCallback(
    async (confirmed: boolean) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        handleResult(await mutateAsync({ orderId, confirmed }));
      } catch (error) {
        showError(getApiErrorMessage(error, REORDER_FALLBACK_MESSAGES.failed));
      } finally {
        inFlightRef.current = false;
      }
    },
    [handleResult, mutateAsync, orderId, showError],
  );

  const start = useCallback(() => send(false), [send]);
  const confirm = useCallback(() => send(true), [send]);

  /** Closes the confirmation sheet; ignored while the confirmed request runs. */
  const dismiss = useCallback(() => {
    if (inFlightRef.current) return;
    setConfirmationOpen(false);
  }, []);

  return {
    confirmation,
    isConfirmationOpen,
    /** Any reorder request in flight; locks the screen's "Siparişi Tekrarla" button. */
    isPending,
    /** The confirmed request from the sheet is in flight. */
    isConfirming: isPending && variables?.confirmed === true,
    start,
    confirm,
    dismiss,
  };
}

export type ReorderController = ReturnType<typeof useReorderController>;
