import { RefundMethod, ReturnPaymentInfo } from '@/types/order.types';

/** Backend refund-method codes (`GET /return-requests/refund-methods`). */
export const REFUND_METHOD_IBAN = 'iban';
export const REFUND_METHOD_GIFT_VOUCHER = 'gift_voucher';

/**
 * Resolves which method is active: the user's pick while it is still in the list.
 * There is no default — the refund method is a required, explicit choice (web parity).
 */
export function resolveRefundMethod(
  methods: RefundMethod[],
  pickedId: number | null,
): RefundMethod | null {
  if (pickedId === null) return null;
  return methods.find((method) => method.id === pickedId) ?? null;
}

/** True when the completed return was settled as a store coupon instead of a transfer. */
export function isGiftVoucherRefund(info: ReturnPaymentInfo | null | undefined): boolean {
  if (!info) return false;
  return info.type === REFUND_METHOD_GIFT_VOUCHER || info.refundMethodCode === REFUND_METHOD_GIFT_VOUCHER;
}
