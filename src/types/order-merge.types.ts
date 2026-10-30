/** How the approved order was paid; decides the merge path (no card step for COD). */
export type OrderMergePaymentKind = 'cod' | 'card';

/**
 * Offer to add the cart to the customer's approved, not yet picked order with free
 * shipping. Every text comes from the backend (`GET /order/merge-eligible` → `ui`).
 */
export interface OrderMergeOffer {
  orderId: number;
  orderNo: string;
  paymentKind: OrderMergePaymentKind;
  title: string;
  description: string;
  amountText: string;
  /** "Peşin Fiyatına 3 Taksit" for installment orders; null for single payment and COD. */
  installmentText: string | null;
  confirmLabel: string;
  continueLabel: string;
}

/** Result of adding the cart to a cash-on-delivery order (`POST /order/merge-cod`). */
export interface OrderMergeCodResult {
  orderNo: string;
  message: string;
}

/**
 * Draft order prepared for the card payment of the difference
 * (`POST /order/merge-card-prepare`). Cargo is free and the installment count is
 * fixed to the approved order's.
 */
export interface OrderMergeCardSession {
  orderToken: string;
  /** The approved order the products are added to; the customer only ever sees this number. */
  parentOrderNo: string;
  amount: number;
  installmentCount: number;
  cargoId: number;
  paymentMethodId: number;
}
