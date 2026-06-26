import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { CheckoutController } from './use-checkout-controller';
import { isGarantiRouterResponse, mapGarantiForm } from '../api/checkout.mapper';
import { buildGarantiFormHtml } from '../utils/build-garanti-form-html';
import { parsePrice } from '../utils/parse-price';
import { getApiErrorMessage } from '../utils/error-message';
import {
  confirmOrderDto,
  getClientIp,
  initializeIyzico3dsDto,
  routePaymentDto,
  updateOrderTokenDto,
} from '@/services/checkout.service';
import { cartKeys } from '@/features/cart/api/cart.keys';

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

/** A 3D Secure hand-off the screen renders in the payment WebView. */
export type ThreeDSPayload =
  | { kind: 'garanti-form'; html: string }
  | { kind: 'iyzico-html'; html: string }
  | { kind: 'url'; url: string };

export interface PlaceOrderController {
  submit: () => void;
  isSubmitting: boolean;
  threeDS: ThreeDSPayload | null;
  closeThreeDS: () => void;
}

/**
 * Place-order orchestration, mirroring the web `handleCheckout` minus PayTR:
 * - non-card (Kapıda Ödeme …) → `/order/confirm` → native success
 * - card + single (Tek Çekim) → `/order/token` → `/payment-router` (Garanti) →
 *   `/order/confirm` (pre-confirm) → Garanti 3D form in the WebView
 * - card + installment → İyzico `/iyzico-prod/3ds/initialize` → 3DS HTML in the WebView
 */
export function usePlaceOrder(controller: CheckoutController): PlaceOrderController {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [threeDS, setThreeDS] = useState<ThreeDSPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fail = useCallback(
    (message: string) => {
      controller.setSubmitError(message);
    },
    [controller],
  );

  const submit = useCallback(async () => {
    if (isSubmitting) return;

    const {
      orderToken,
      shippingAddress,
      billingAddress,
      sendInvoiceToSameAddress,
      selectedCargo,
      selectedMethod,
      isCardPayment,
      card,
      totals,
      items,
      appliedCoupon,
    } = controller;

    if (!shippingAddress) return fail('Lütfen teslimat adresi seçin.');
    if (!selectedCargo) return fail('Lütfen kargo seçin.');
    if (!selectedMethod) return fail('Lütfen ödeme yöntemi seçin.');
    if (!sendInvoiceToSameAddress && !billingAddress) return fail('Lütfen bir fatura adresi seçin.');
    if (!orderToken) return fail('Sipariş hazırlanamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
    if (isCardPayment && !card.isValid) return fail('Lütfen kart bilgilerini eksiksiz doldurun.');

    const billingId = sendInvoiceToSameAddress
      ? shippingAddress.id
      : (billingAddress?.id ?? shippingAddress.id);
    const finalTotal = totals.finalTotal;

    setIsSubmitting(true);
    controller.setSubmitError(null);

    try {
      // ---- Non-card (Kapıda Ödeme, etc.) ----
      if (!isCardPayment) {
        const res = await confirmOrderDto({
          order_token: orderToken,
          payment_method_id: selectedMethod.id,
          shipping_address_id: shippingAddress.id,
          billing_address_id: billingId,
          cargo_id: selectedCargo.id,
          total_price: finalTotal.toFixed(2),
        });
        if (!res.message) throw new Error('Sipariş oluşturulurken bir hata oluştu.');

        await queryClient.invalidateQueries({ queryKey: cartKeys.all });
        const token = res.order_token ?? res.order?.secure_token ?? '';
        router.replace({
          pathname: '/checkout/payment-success',
          params: token
            ? { secureToken: token, totalPrice: String(finalTotal) }
            : { orderNo: res.order_no ?? '', totalPrice: String(finalTotal) },
        });
        return;
      }

      // ---- Card + installment → İyzico 3DS ----
      if (card.selectedPlan) {
        const init = await initializeIyzico3dsDto({
          order_token: orderToken,
          cargo_id: selectedCargo.id,
          payment_method_id: selectedMethod.id,
          installment: card.selectedPlan.installment,
          total_price: finalTotal,
          paymentCard: {
            cardHolderName: card.values.owner,
            cardNumber: card.digits,
            expireYear: card.values.expiryYear,
            expireMonth: card.values.expiryMonth.padStart(2, '0'),
            cvc: card.values.cvv,
            registerCard: '0',
          },
        });

        const html =
          init.threeDSHtmlContent ??
          init.checkoutFormContent ??
          init.data?.threeDSHtmlContent ??
          init.data?.checkoutFormContent;
        if (html) {
          setThreeDS({ kind: 'iyzico-html', html: String(html) });
          return;
        }

        const url =
          init.paymentPageUrl ??
          init.callbackUrl ??
          init.url ??
          init.data?.paymentPageUrl ??
          init.data?.callbackUrl ??
          init.data?.url;
        if (url) {
          setThreeDS({ kind: 'url', url: String(url) });
          return;
        }
        throw new Error(init.message ?? 'İyzico ödeme sayfası açılamadı.');
      }

      // ---- Card + single (Tek Çekim) → Garanti 3D ----
      const tokenRes = await updateOrderTokenDto({
        order_token: orderToken,
        cargo_id: selectedCargo.id,
        payment_method_id: selectedMethod.id,
        total_price: finalTotal.toFixed(2),
        installment_count: 1,
        coupon_code: appliedCoupon?.code,
        shipping_address_id: shippingAddress.id,
        billing_address_id: billingId,
      });
      if (tokenRes.coupon_error) throw new Error(tokenRes.coupon_error);

      const backendTotal = parsePrice(tokenRes.total_price ?? null);
      if (backendTotal > 0 && Math.abs(backendTotal - finalTotal) > 0.01) {
        throw new Error(
          `Sipariş tutarı güncellendi: ${backendTotal.toFixed(2)} TL. Lütfen kontrol edip tekrar deneyin.`,
        );
      }

      const ip = await getClientIp();
      const basket = items.map((item) => ({
        name: item.title,
        price: item.unitPrice,
        quantity: item.quantity,
      }));

      const routerRes = await routePaymentDto({
        total_price: finalTotal,
        installment_count: 0,
        order_token: orderToken,
        cargo_id: selectedCargo.id,
        payment_method_id: selectedMethod.id,
        basket,
        card_number: card.digits,
        expire_month: card.values.expiryMonth,
        expire_year: card.values.expiryYear,
        cvv: card.values.cvv,
        customer_ip: ip,
      });

      if (routerRes.status === 'error') {
        throw new Error(routerRes.message ?? 'Ödeme işlemi başlatılamadı.');
      }
      if (!isGarantiRouterResponse(routerRes)) {
        throw new Error('Bu ödeme için kart altyapısı şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
      }

      const garanti = mapGarantiForm(routerRes, 1);

      // Pre-confirm before redirecting to 3D (mirrors the web Garanti flow).
      await confirmOrderDto({
        order_token: orderToken,
        payment_method_id: selectedMethod.id,
        shipping_address_id: shippingAddress.id,
        billing_address_id: billingId,
        cargo_id: selectedCargo.id,
        payment_info: { card_first_4: card.digits.slice(0, 4), card_last_6: card.digits.slice(-6) },
      });

      const ipForForm =
        garanti.customerIpAddress && IP_REGEX.test(garanti.customerIpAddress)
          ? garanti.customerIpAddress
          : ip;
      setThreeDS({
        kind: 'garanti-form',
        html: buildGarantiFormHtml(garanti, card.values, shippingAddress.email, ipForForm),
      });
    } catch (error) {
      fail(getApiErrorMessage(error, 'Ödeme işlemi başlatılamadı.'));
    } finally {
      setIsSubmitting(false);
    }
  }, [controller, fail, isSubmitting, queryClient, router]);

  return {
    submit,
    isSubmitting,
    threeDS,
    closeThreeDS: () => setThreeDS(null),
  };
}
