import {
  OrderMergeCardSession,
  OrderMergeCodResult,
  OrderMergeOffer,
  OrderMergePaymentKind,
} from '@/types/order-merge.types';
import {
  OrderMergeCardPrepareResponseDto,
  OrderMergeCodResponseDto,
  OrderMergeEligibilityDto,
  OrderMergeOrderDto,
} from './order-merge.dtos';

/** Used only when the backend leaves a text empty; the backend owns the wording. */
export const ORDER_MERGE_FALLBACK_TEXTS = {
  title: 'Onaylanmış Siparişiniz Var!',
  confirmLabel: 'Mevcut Siparişime Ekle',
  continueLabel: 'Yeni Sipariş Olarak Devam Et',
  codSuccess: 'Ürünler siparişinize eklendi.',
  codFailed: 'Ürünler siparişinize eklenemedi. Lütfen tekrar deneyin.',
  cardPrepareFailed: 'Ödeme adımı hazırlanamadı. Lütfen tekrar deneyin.',
} as const;

function text(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
}

function toPositiveInt(value: number | string | null | undefined): number | null {
  const parsed = toNumber(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function getPaymentKind(order: OrderMergeOrderDto): OrderMergePaymentKind | null {
  if (order.is_cod === true) return 'cod';
  if (order.is_card === true) return 'card';
  return null;
}

/**
 * Turns the eligibility answer into an offer, or `null` when the cart should go
 * through the normal checkout. An answer the app cannot act on (no order id or no
 * payment type) is treated as "not eligible" rather than guessed.
 */
export function mapOrderMergeEligibility(
  dto: OrderMergeEligibilityDto | null | undefined,
): OrderMergeOffer | null {
  if (dto?.eligible !== true || !dto.order) return null;

  const orderId = toPositiveInt(dto.order.id);
  const orderNo = text(dto.order.order_no);
  const paymentKind = getPaymentKind(dto.order);
  if (orderId === null || !orderNo || paymentKind === null) return null;

  const ui = dto.ui ?? {};
  const installmentText = paymentKind === 'card' ? text(ui.installment_text) : '';

  return {
    orderId,
    orderNo,
    paymentKind,
    title: text(ui.title) || ORDER_MERGE_FALLBACK_TEXTS.title,
    description: text(ui.description),
    amountText: text(ui.diff_amount_text),
    installmentText: installmentText || null,
    confirmLabel: text(ui.button_text) || ORDER_MERGE_FALLBACK_TEXTS.confirmLabel,
    continueLabel: text(ui.secondary_button_text) || ORDER_MERGE_FALLBACK_TEXTS.continueLabel,
  };
}

export function mapOrderMergeCodResult(
  dto: OrderMergeCodResponseDto,
  fallbackOrderNo: string,
): OrderMergeCodResult {
  if (dto.success === false) {
    throw new Error(text(dto.message) || ORDER_MERGE_FALLBACK_TEXTS.codFailed);
  }
  return {
    orderNo: text(dto.order_no) || fallbackOrderNo,
    message: text(dto.message) || ORDER_MERGE_FALLBACK_TEXTS.codSuccess,
  };
}

/**
 * Validates the prepared draft. Without a token, a positive amount, cargo and
 * payment method the card step cannot be started safely, so it fails loudly.
 */
export function mapOrderMergeCardSession(
  dto: OrderMergeCardPrepareResponseDto,
  fallbackOrderNo: string,
): OrderMergeCardSession {
  const orderToken = text(dto.order_token);
  const amount = [dto.diff_total, dto.total_price, dto.diff_amount]
    .map(toNumber)
    .find((value) => Number.isFinite(value) && value > 0);
  const cargoId = toPositiveInt(dto.cargo_id);
  const paymentMethodId = toPositiveInt(dto.payment_method_id);

  if (dto.success === false || !orderToken || amount === undefined || !cargoId || !paymentMethodId) {
    throw new Error(text(dto.message) || ORDER_MERGE_FALLBACK_TEXTS.cardPrepareFailed);
  }

  return {
    orderToken,
    parentOrderNo: text(dto.parent_order_no) || text(dto.order_no) || fallbackOrderNo,
    amount,
    installmentCount: toPositiveInt(dto.installment_count) ?? 1,
    cargoId,
    paymentMethodId,
  };
}
