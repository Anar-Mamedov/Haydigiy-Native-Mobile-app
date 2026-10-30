import { OrderMergeCardSession } from '@/types/order-merge.types';

export const ORDER_MERGE_PAYMENT_PATH = '/checkout/merge-payment';

export type OrderMergePaymentParams = {
  orderToken: string;
  orderNo: string;
  amount: string;
  installmentCount: string;
  cargoId: string;
  paymentMethodId: string;
};

type RawParams = Partial<Record<keyof OrderMergePaymentParams, string | string[]>>;

/**
 * The card step travels as route params (strings). The amount is for display only:
 * the backend charges the draft order's own total.
 */
export function toOrderMergePaymentParams(session: OrderMergeCardSession): OrderMergePaymentParams {
  return {
    orderToken: session.orderToken,
    orderNo: session.parentOrderNo,
    amount: String(session.amount),
    installmentCount: String(session.installmentCount),
    cargoId: String(session.cargoId),
    paymentMethodId: String(session.paymentMethodId),
  };
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

function positive(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** `null` when a param is missing or broken (e.g. an old deep link) — the screen then sends the user back. */
export function parseOrderMergePaymentParams(params: RawParams): OrderMergeCardSession | null {
  const orderToken = first(params.orderToken);
  const parentOrderNo = first(params.orderNo);
  const amount = positive(first(params.amount));
  const installmentCount = positive(first(params.installmentCount));
  const cargoId = positive(first(params.cargoId));
  const paymentMethodId = positive(first(params.paymentMethodId));

  if (!orderToken || !parentOrderNo || amount === null || cargoId === null || paymentMethodId === null) {
    return null;
  }

  return {
    orderToken,
    parentOrderNo,
    amount,
    installmentCount: installmentCount !== null && Number.isInteger(installmentCount) ? installmentCount : 1,
    cargoId,
    paymentMethodId,
  };
}
