import { useCallback, useState } from 'react';
import { CardFormController, useCardForm } from '@/features/checkout/hooks/use-card-form';
import { ThreeDSPayload } from '@/features/checkout/hooks/use-place-order';
import { buildGarantiFormHtml } from '@/features/checkout/utils/build-garanti-form-html';
import { getApiErrorMessage } from '@/features/checkout/utils/error-message';
import { resolvePaymentRouterHandoff } from '@/features/checkout/utils/payment-router-handoff';
import { setPurchaseSnapshot } from '@/features/checkout/utils/purchase-snapshot';
import { useCartStore } from '@/features/cart/store/use-cart-store';
import { getClientIp, routePaymentDto } from '@/services/checkout.service';
import { OrderMergeCardSession } from '@/types/order-merge.types';

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

export interface OrderMergePaymentController {
  card: CardFormController;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  threeDS: ThreeDSPayload | null;
  submit: () => void;
  closeThreeDS: () => void;
}

/**
 * Card payment of the difference for "Mevcut siparişime ekle". The draft order
 * already holds the address, free cargo and the payment method, so only the card is
 * asked for. `/payment-router` charges the draft's own total with the approved
 * order's installment count (enforced by the backend as well); the bank then
 * redirects to the approved order's success page, which the payment WebView hands
 * to the native success screen. No `/order/token` or `/order/confirm` call: those
 * would recalculate the draft with cargo and fees.
 */
export function useOrderMergePayment(session: OrderMergeCardSession): OrderMergePaymentController {
  // Taksit seçimi yok: ana siparişin taksit sayısı backend'de sabit.
  const card = useCardForm(session.amount, false);
  const items = useCartStore((state) => state.items);
  const [threeDS, setThreeDS] = useState<ThreeDSPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitPayment = useCallback(async () => {
    if (isSubmitting) return;
    if (!card.isValid) {
      setSubmitError('Lütfen kart bilgilerini eksiksiz doldurun.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    // Başarı ekranındaki satın alma eventi bu satırlardan beslenir (sepet o an boş olabilir).
    setPurchaseSnapshot(items);

    try {
      const ip = await getClientIp();
      const response = await routePaymentDto({
        total_price: session.amount,
        installment_count: session.installmentCount > 1 ? session.installmentCount : 0,
        order_token: session.orderToken,
        cargo_id: session.cargoId,
        payment_method_id: session.paymentMethodId,
        basket: items.map((item) => ({
          name: item.title,
          price: item.unitPrice,
          quantity: item.quantity,
        })),
        card_number: card.digits,
        card_holder_name: card.values.owner,
        expire_month: card.values.expiryMonth,
        expire_year: card.values.expiryYear,
        cvv: card.values.cvv,
        customer_ip: ip,
      });

      const handoff = resolvePaymentRouterHandoff(response, 1);
      if (handoff.kind === 'hosted-3ds') {
        setThreeDS(handoff.handoff);
        return;
      }

      const formIp = IP_REGEX.test(handoff.form.customerIpAddress)
        ? handoff.form.customerIpAddress
        : ip;
      setThreeDS({
        kind: 'garanti-form',
        html: buildGarantiFormHtml(handoff.form, card.values, null, formIp),
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Ödeme işlemi başlatılamadı.'));
    } finally {
      setIsSubmitting(false);
    }
  }, [card, isSubmitting, items, session]);

  const submit = useCallback(() => {
    void submitPayment();
  }, [submitPayment]);

  // 3DS iptal edildi: taslak sipariş duruyor, kullanıcı kartı düzeltip yeniden deneyebilir.
  const closeThreeDS = useCallback(() => setThreeDS(null), []);

  return {
    card,
    canSubmit: card.isValid && !isSubmitting,
    isSubmitting,
    submitError,
    threeDS,
    submit,
    closeThreeDS,
  };
}
