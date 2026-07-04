import { useEffect, useRef } from 'react';
import { updateOrderTokenDto, OrderTokenCouponDto } from '@/services/checkout.service';
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

/**
 * Keeps the backend draft order in sync with the checkout screen, mirroring the
 * web payment page's on-change `updateOrderToken` effect: it fires as soon as
 * the screen has an order token + cargo + payment method, and again whenever
 * any total-affecting selection changes. This rewrites the draft order to THIS
 * screen's state on entry — repairing whatever an earlier visit from another
 * platform (e.g. the web payment page) left on the order — so the submit-time
 * total guard compares against a row this screen produced.
 *
 * Web parity details: identical request-key dedup, 422 responses are ignored
 * silently, and coupon recalculations from the response are folded back into
 * the coupon state.
 */
export function useOrderTokenSync(input: OrderTokenSyncInput): void {
  const {
    orderToken,
    selectedCargo,
    selectedMethod,
    shippingAddress,
    billingAddressId,
    finalTotal,
    installmentCount,
    appliedCoupon,
    isPaused,
  } = input;

  const lastRequestKeyRef = useRef('');
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

  useEffect(() => {
    if (isPaused?.()) return;
    if (!orderToken || !selectedCargo || !selectedMethod || !shippingAddress) return;
    if (!(finalTotal > 0)) return;

    const requestKey = [
      orderToken,
      selectedCargo.id,
      selectedMethod.id,
      installmentCount,
      finalTotal.toFixed(2),
      appliedCoupon?.code ?? '',
    ].join('-');
    if (lastRequestKeyRef.current === requestKey) return;
    lastRequestKeyRef.current = requestKey;

    let cancelled = false;

    (async () => {
      try {
        const response = await updateOrderTokenDto({
          order_token: orderToken,
          cargo_id: selectedCargo.id,
          payment_method_id: selectedMethod.id,
          total_price: finalTotal.toFixed(2),
          installment_count: installmentCount,
          coupon_code: appliedCoupon?.code,
          shipping_address_id: shippingAddress.id,
          billing_address_id: billingAddressId ?? shippingAddress.id,
        });
        if (cancelled) return;

        if (response.coupon_error) {
          callbacksRef.current.onCouponError(response.coupon_error);
        } else if (response.coupon) {
          callbacksRef.current.onCouponRefresh(response.coupon);
        }
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        // Web paritesi: 422 (ör. sipariş zaten işlenmiş) arka plan senkronunda
        // sessizce yutulur; diğer hatalarda anahtar sıfırlanır ki tekrar denensin.
        if (status === 422) return;
        lastRequestKeyRef.current = '';
        if (!cancelled) {
          callbacksRef.current.onSyncError(
            getApiErrorMessage(error, 'Ödeme bilgileri güncellenemedi.'),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    orderToken,
    selectedCargo,
    selectedMethod,
    shippingAddress,
    billingAddressId,
    finalTotal,
    installmentCount,
    appliedCoupon,
    isPaused,
  ]);
}
