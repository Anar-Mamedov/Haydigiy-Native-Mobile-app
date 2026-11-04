import { ReturnPaymentInfo } from '@/types/order.types';

/** Backend refund-method code of a return settled as a store coupon. */
export const REFUND_METHOD_GIFT_VOUCHER = 'gift_voucher';

/**
 * True when the completed return was settled as a store coupon instead of a transfer.
 * New returns can no longer pick a coupon (backend `0b6d92d`), but earlier ones
 * still show their coupon in the order detail.
 */
export function isGiftVoucherRefund(info: ReturnPaymentInfo | null | undefined): boolean {
  if (!info) return false;
  return info.type === REFUND_METHOD_GIFT_VOUCHER || info.refundMethodCode === REFUND_METHOD_GIFT_VOUCHER;
}
