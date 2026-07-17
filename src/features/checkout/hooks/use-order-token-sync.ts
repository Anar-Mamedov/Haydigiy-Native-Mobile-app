import { useCallback, useEffect, useRef } from 'react';
import {
  OrderTokenCouponDto,
  OrderTokenRequestDto,
  OrderTokenResponseDto,
} from '@/services/checkout.service';
import { useUpdateOrderTokenMutation } from '../api/checkout.mutations';
import { getApiErrorMessage } from '../utils/error-message';
import {
  AppliedCoupon,
  CargoCompany,
  CheckoutAddress,
  PaymentMethod,
} from '@/types/checkout.types';

export interface OrderTokenSyncInput {
  orderToken: string | null;
  selectedCargo: CargoCompany | null;
  selectedMethod: PaymentMethod | null;
  shippingAddress: CheckoutAddress | null;
  billingAddressId: number | null;
  finalTotal: number;
  installmentCount: number;
  appliedCoupon: AppliedCoupon | null;
  /**
   * Sipariş gönderildikten sonra senkronu durdurur (web `orderSubmittedRef`
   * paritesi): onay sonrası sepet boşalınca toplam değişir ve effect işlenmiş
   * siparişe boş yere `/order/token` atar; backend bunu 422 ile reddeder.
   */
  isPaused?: () => boolean;
  onCouponError: (message: string) => void;
  onCouponRefresh: (coupon: OrderTokenCouponDto) => void;
  onSyncError: (message: string) => void;
}

export interface OrderTokenSyncController {
  /**
   * Waits for the latest checkout snapshot to be persisted. Submit-time price
   * freshness checks can force a new backend request instead of reusing cache.
   */
  syncNow: (options?: { forceNetwork?: boolean }) => Promise<OrderTokenResponseDto | null>;
}

type OrderTokenSyncSnapshot = {
  key: string;
  request: OrderTokenRequestDto;
};

function buildSyncSnapshot(input: OrderTokenSyncInput): OrderTokenSyncSnapshot | null {
  const {
    orderToken,
    selectedCargo,
    selectedMethod,
    shippingAddress,
    billingAddressId,
    finalTotal,
    installmentCount,
    appliedCoupon,
  } = input;

  if (input.isPaused?.()) return null;
  if (!orderToken || !selectedCargo || !selectedMethod || !shippingAddress) return null;
  if (!(finalTotal > 0)) return null;

  const request: OrderTokenRequestDto = {
    order_token: orderToken,
    cargo_id: selectedCargo.id,
    payment_method_id: selectedMethod.id,
    total_price: finalTotal.toFixed(2),
    installment_count: installmentCount,
    coupon_code: appliedCoupon?.code,
    shipping_address_id: shippingAddress.id,
    billing_address_id: billingAddressId ?? shippingAddress.id,
  };

  return {
    key: [
      request.order_token,
      request.cargo_id,
      request.payment_method_id,
      request.installment_count,
      request.total_price,
      request.coupon_code ?? '',
      request.shipping_address_id ?? '',
      request.billing_address_id ?? '',
    ].join('-'),
    request,
  };
}

/**
 * Keeps the backend draft order in sync with the checkout screen, mirroring the
 * web payment page's on-change `updateOrderToken` effect: it fires as soon as
 * the screen has an order token + cargo + payment method, and again whenever
 * any total-affecting selection changes. This rewrites the draft order to THIS
 * screen's state on entry — repairing whatever an earlier visit from another
 * platform (e.g. the web payment page) left on the order — so the submit-time
 * total guard compares against a row this screen produced.
 *
 * Web parity details: identical checkout snapshots are deduplicated, 422
 * responses are ignored silently in the background, and coupon recalculations
 * are folded back into the coupon state.
 *
 * Unlike the web effect, requests are serialized here. A selection change can
 * therefore never let an older request finish after a newer one and overwrite
 * the draft order. Background calls reuse matching work. Non-installment submit
 * checks force a new request so cross-device cart changes are read from the
 * backend immediately, matching the web payment flow.
 */
export function useOrderTokenSync(input: OrderTokenSyncInput): OrderTokenSyncController {
  const updateOrderToken = useUpdateOrderTokenMutation();
  const mutateAsyncRef = useRef(updateOrderToken.mutateAsync);
  mutateAsyncRef.current = updateOrderToken.mutateAsync;

  const inputRef = useRef(input);
  inputRef.current = input;

  const queueTailRef = useRef<Promise<void>>(Promise.resolve());
  const pendingByKeyRef = useRef(new Map<string, Promise<OrderTokenResponseDto>>());
  const lastScheduledKeyRef = useRef('');
  const lastSuccessfulRef = useRef<{
    key: string;
    response: OrderTokenResponseDto;
  } | null>(null);

  // Callback'ler her render'da yeni referans alabilir; senkronu yeniden
  // tetiklememeleri için ref üzerinden okunur.
  const callbacksRef = useRef({
    onCouponError: input.onCouponError,
    onCouponRefresh: input.onCouponRefresh,
    onSyncError: input.onSyncError,
  });
  callbacksRef.current = {
    onCouponError: input.onCouponError,
    onCouponRefresh: input.onCouponRefresh,
    onSyncError: input.onSyncError,
  };

  const syncNow = useCallback((options?: { forceNetwork?: boolean }): Promise<OrderTokenResponseDto | null> => {
    const snapshot = buildSyncSnapshot(inputRef.current);
    if (!snapshot) return Promise.resolve(null);

    // Reusing a pending or completed write is only safe while this snapshot is
    // also the LAST scheduled one. If a different snapshot was queued after it
    // (state went A → B → back to A), that later write still lands on top and
    // the draft order would not end at this state — queue a fresh write instead.
    const isLastScheduledWrite =
      lastScheduledKeyRef.current === '' || lastScheduledKeyRef.current === snapshot.key;
    if (!options?.forceNetwork && isLastScheduledWrite) {
      const pending = pendingByKeyRef.current.get(snapshot.key);
      if (pending) return pending;

      if (
        pendingByKeyRef.current.size === 0 &&
        lastSuccessfulRef.current?.key === snapshot.key
      ) {
        return Promise.resolve(lastSuccessfulRef.current.response);
      }
    }

    lastScheduledKeyRef.current = snapshot.key;
    const requestPromise = queueTailRef.current
      .catch(() => undefined)
      .then(() => mutateAsyncRef.current(snapshot.request));

    const processedPromise = requestPromise.then(
      (response) => {
        lastSuccessfulRef.current = { key: snapshot.key, response };

        // A stale response must not mutate current coupon UI state. Its server
        // write is safe because a newer snapshot is serialized behind it.
        if (buildSyncSnapshot(inputRef.current)?.key === snapshot.key) {
          if (response.coupon_error) {
            callbacksRef.current.onCouponError(response.coupon_error);
          } else if (response.coupon) {
            callbacksRef.current.onCouponRefresh(response.coupon);
          }
        }

        return response;
      },
      (error: unknown) => {
        // A network failure can occur after the server applied the write, so a
        // previous successful snapshot can no longer be treated as authoritative.
        lastSuccessfulRef.current = null;
        throw error;
      },
    );

    let queuedPromise: Promise<OrderTokenResponseDto>;
    queuedPromise = processedPromise.finally(() => {
      if (pendingByKeyRef.current.get(snapshot.key) === queuedPromise) {
        pendingByKeyRef.current.delete(snapshot.key);
      }
    });

    pendingByKeyRef.current.set(snapshot.key, queuedPromise);
    queueTailRef.current = queuedPromise.then(
      () => undefined,
      () => undefined,
    );

    return queuedPromise;
  }, []);

  useEffect(() => {
    let cancelled = false;

    void syncNow().catch((error: unknown) => {
      if (!cancelled) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        // Web paritesi: 422 (ör. sipariş zaten işlenmiş) arka plan senkronunda
        // sessizce yutulur.
        if (status === 422) return;
        callbacksRef.current.onSyncError(
          getApiErrorMessage(error, 'Ödeme bilgileri güncellenemedi.'),
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    input.orderToken,
    input.selectedCargo,
    input.selectedMethod,
    input.shippingAddress,
    input.billingAddressId,
    input.finalTotal,
    input.installmentCount,
    input.appliedCoupon,
    input.isPaused,
    syncNow,
  ]);

  return { syncNow };
}
