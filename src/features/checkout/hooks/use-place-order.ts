import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { CheckoutController } from './use-checkout-controller';
import { isGarantiRouterResponse, mapGarantiForm } from '../api/checkout.mapper';
import { getOrderTokenSummaryError, mapOrderTokenSummary } from '../api/order-token-summary.mapper';
import { buildGarantiFormHtml } from '../utils/build-garanti-form-html';
import { getApiErrorMessage } from '../utils/error-message';
import { isCheckoutPriceChangeMessage } from '../utils/checkout-price-change';
import { setPurchaseSnapshot } from '../utils/purchase-snapshot';
import {
  confirmOrderDto,
  getClientIp,
  initializeIyzico3dsDto,
  routePaymentDto,
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
  priceChangeConfirmation: { message: string } | null;
  confirmPriceChange: () => void;
  cancelPriceChange: () => void;
  closeThreeDS: () => void;
}

/**
 * Place-order orchestration, mirroring the web `handleCheckout` minus PayTR:
 * - non-card (Kapıda Ödeme …) → `/order/token` → `/order/confirm` → native success
 * - card + single (Tek Çekim) → `/order/token` → `/payment-router` (Garanti) →
 *   `/order/confirm` (pre-confirm) → Garanti 3D form in the WebView
 * - card + installment → İyzico `/iyzico-prod/3ds/initialize` → 3DS HTML in
 *   the WebView (the web skips submit-time `/order/token` for this path)
 *
 * The web keeps the draft row fresh with an on-change `updateOrderToken` effect.
 * Mobile mirrors that background sync. At submit time, non-card and single-card
 * paths await and verify the matching snapshot; the İyzico installment path
 * deliberately proceeds directly to initialize, matching the web branch exactly.
 * After an explicit price-change modal confirmation, however, the confirmed retry
 * waits for one fresh token sync so the refreshed cart is persisted before 3DS.
 */
export function usePlaceOrder(controller: CheckoutController): PlaceOrderController {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [threeDS, setThreeDS] = useState<ThreeDSPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceChangeConfirmation, setPriceChangeConfirmation] = useState<{
    message: string;
  } | null>(null);

  const fail = useCallback(
    (message: string) => {
      controller.setSubmitError(message);
    },
    [controller],
  );

  const executeSubmit = useCallback(
    async (hasConfirmedPriceChange: boolean) => {
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
        orderSummary,
        items,
        syncOrderToken,
        refetchCart,
        markOrderSubmitted,
      } = controller;

      if (!shippingAddress) return fail('Lütfen teslimat adresi seçin.');
      if (!selectedCargo) return fail('Lütfen kargo seçin.');
      if (!selectedMethod) return fail('Lütfen ödeme yöntemi seçin.');
      if (!sendInvoiceToSameAddress && !billingAddress)
        return fail('Lütfen bir fatura adresi seçin.');
      if (!orderToken)
        return fail('Sipariş hazırlanamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
      if (!orderSummary)
        return fail('Sipariş tutarları API’den henüz alınamadı. Lütfen tekrar deneyin.');
      if (isCardPayment && !card.isValid) return fail('Lütfen kart bilgilerini eksiksiz doldurun.');

      const billingId = sendInvoiceToSameAddress
        ? shippingAddress.id
        : (billingAddress?.id ?? shippingAddress.id);
      const finalTotal = orderSummary.totalPrice;

      setIsSubmitting(true);
      setPriceChangeConfirmation(null);
      controller.setSubmitError(null);

      // Ödeme başarı ekranı sepeti boşalmış bulabilir; Insider purchase eventi
      // bu anda alınan satır kopyalarından beslenir (başarıda tek sefer tüketilir).
      setPurchaseSnapshot(items);

      // Waits for the shared cargo/payment/coupon + campaign snapshot sync and
      // verifies the backend's persisted total against the total shown on screen.
      const verifySyncedOrderToken = async () => {
        // The web always posts a fresh `/order/token` request at submit time for
        // non-installment paths. Do not reuse the background-sync cache: the cart
        // may have changed from another device while this screen stayed open.
        const tokenRes = await syncOrderToken({ forceNetwork: true });
        if (!tokenRes) {
          throw new Error('Sipariş bilgileri henüz senkronize edilemedi. Lütfen tekrar deneyin.');
        }
        if (tokenRes.coupon_error) throw new Error(tokenRes.coupon_error);

        const mapping = mapOrderTokenSummary(tokenRes);
        if (!mapping.ok) {
          throw new Error(getOrderTokenSummaryError(mapping.missingFields));
        }

        const backendTotal = mapping.summary.totalPrice;
        if (Math.abs(backendTotal - finalTotal) > 0.01) {
          throw new Error(
            `Sipariş tutarı güncellendi: ${backendTotal.toFixed(2)} TL. Lütfen kontrol edip tekrar deneyin.`,
          );
        }
      };

      try {
        // ---- Non-card (Kapıda Ödeme, etc.) ----
        if (!isCardPayment) {
          await verifySyncedOrderToken();

          const res = await confirmOrderDto({
            order_token: orderToken,
            payment_method_id: selectedMethod.id,
            shipping_address_id: shippingAddress.id,
            billing_address_id: billingId,
            cargo_id: selectedCargo.id,
            total_price: finalTotal.toFixed(2),
          });
          if (!res.message) throw new Error('Sipariş oluşturulurken bir hata oluştu.');

          // Sepet boşalınca değişen toplam, işlenmiş siparişe boş yere /order/token
          // attırmasın (web `orderSubmittedRef` paritesi).
          markOrderSubmitted();
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
          if (hasConfirmedPriceChange) {
            await verifySyncedOrderToken();
          }

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
            markOrderSubmitted();
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
            markOrderSubmitted();
            setThreeDS({ kind: 'url', url: String(url) });
            return;
          }
          throw new Error(init.message ?? 'İyzico ödeme sayfası açılamadı.');
        }

        // ---- Card + single (Tek Çekim) → Garanti 3D ----
        await verifySyncedOrderToken();

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
          throw new Error(
            'Bu ödeme için kart altyapısı şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
          );
        }

        const garanti = mapGarantiForm(routerRes, 1);

        // Pre-confirm before redirecting to 3D (mirrors the web Garanti flow).
        await confirmOrderDto({
          order_token: orderToken,
          payment_method_id: selectedMethod.id,
          shipping_address_id: shippingAddress.id,
          billing_address_id: billingId,
          cargo_id: selectedCargo.id,
          payment_info: {
            card_first_4: card.digits.slice(0, 4),
            card_last_6: card.digits.slice(-6),
          },
        });

        const ipForForm =
          garanti.customerIpAddress && IP_REGEX.test(garanti.customerIpAddress)
            ? garanti.customerIpAddress
            : ip;
        markOrderSubmitted();
        setThreeDS({
          kind: 'garanti-form',
          html: buildGarantiFormHtml(garanti, card.values, shippingAddress.email, ipForForm),
        });
      } catch (error) {
        const message = getApiErrorMessage(error, 'Ödeme işlemi başlatılamadı.');

        if (isCheckoutPriceChangeMessage(message)) {
          try {
            const refreshedCart = await refetchCart();
            if (refreshedCart.isError) {
              fail(
                `${message} Güncel sepet bilgileri alınamadı; lütfen bağlantınızı kontrol edip tekrar deneyin.`,
              );
            } else {
              setPriceChangeConfirmation({ message });
            }
          } catch {
            fail(
              `${message} Güncel sepet bilgileri alınamadı; lütfen bağlantınızı kontrol edip tekrar deneyin.`,
            );
          }
        } else {
          fail(message);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [controller, fail, isSubmitting, queryClient, router],
  );

  const submit = useCallback(() => {
    void executeSubmit(false);
  }, [executeSubmit]);

  const confirmPriceChange = useCallback(() => {
    setPriceChangeConfirmation(null);
    void executeSubmit(true);
  }, [executeSubmit]);

  const cancelPriceChange = useCallback(() => {
    setPriceChangeConfirmation(null);
  }, []);

  return {
    submit,
    isSubmitting,
    threeDS,
    priceChangeConfirmation,
    confirmPriceChange,
    cancelPriceChange,
    closeThreeDS: () => {
      // 3DS iptal edildi; kullanıcı seçim değiştirebilir, senkron kaldığı yerden sürsün.
      controller.resumeOrderTokenSync();
      setThreeDS(null);
    },
  };
}
