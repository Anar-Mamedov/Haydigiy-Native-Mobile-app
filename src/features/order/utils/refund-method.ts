import { RefundMethod, ReturnPaymentInfo } from '@/types/order.types';

/** Backend refund-method codes (`GET /return-requests/refund-methods`). */
export const REFUND_METHOD_IBAN = 'iban';
export const REFUND_METHOD_GIFT_VOUCHER = 'gift_voucher';

/**
 * Resolves which method is active: the user's pick when it is still in the list,
 * otherwise IBAN — matching the backend default when `refund_method_id` is omitted.
 */
export function resolveRefundMethod(
  methods: RefundMethod[],
  pickedId: number | null,
): RefundMethod | null {
  if (methods.length === 0) return null;
  const picked = methods.find((method) => method.id === pickedId);
  if (picked) return picked;
  return methods.find((method) => method.code === REFUND_METHOD_IBAN) ?? methods[0];
}

/** True when the completed return was settled as a store coupon instead of a transfer. */
export function isGiftVoucherRefund(info: ReturnPaymentInfo | null | undefined): boolean {
  if (!info) return false;
  return info.type === REFUND_METHOD_GIFT_VOUCHER || info.refundMethodCode === REFUND_METHOD_GIFT_VOUCHER;
}
