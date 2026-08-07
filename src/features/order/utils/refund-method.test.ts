import { isGiftVoucherRefund, resolveRefundMethod } from './refund-method';
import { RefundMethod, ReturnPaymentInfo } from '@/types/order.types';

const IBAN: RefundMethod = { id: 1, name: 'IBAN', code: 'iban' };
const GIFT_VOUCHER: RefundMethod = { id: 2, name: 'Hediye Çeki', code: 'gift_voucher' };

function makeInfo(overrides: Partial<ReturnPaymentInfo> = {}): ReturnPaymentInfo {
  return {
    type: null,
    message: null,
    amount: null,
    couponCode: null,
    expiresAt: null,
    refundMethodCode: null,
    ...overrides,
  };
}

describe('resolveRefundMethod', () => {
  it('returns null when no method is offered', () => {
    expect(resolveRefundMethod([], 2)).toBeNull();
  });

  // Backend `refund_method_id` gelmediğinde IBAN varsayıyor; varsayılan seçim
  // aynı olmazsa kullanıcı gördüğünden başka bir yöntemle iade alırdı.
  it('defaults to IBAN when nothing is picked yet', () => {
    expect(resolveRefundMethod([GIFT_VOUCHER, IBAN], null)).toEqual(IBAN);
  });

  it('falls back to the first method when the list has no IBAN', () => {
    expect(resolveRefundMethod([GIFT_VOUCHER], null)).toEqual(GIFT_VOUCHER);
  });

  it('honours the picked method while it is still in the list', () => {
    expect(resolveRefundMethod([IBAN, GIFT_VOUCHER], GIFT_VOUCHER.id)).toEqual(GIFT_VOUCHER);
  });

  it('ignores a picked id that disappeared from the list', () => {
    expect(resolveRefundMethod([IBAN], GIFT_VOUCHER.id)).toEqual(IBAN);
  });
});

describe('isGiftVoucherRefund', () => {
  it('is false without refund info', () => {
    expect(isGiftVoucherRefund(null)).toBe(false);
    expect(isGiftVoucherRefund(undefined)).toBe(false);
  });

  it('is false for an IBAN refund', () => {
    expect(isGiftVoucherRefund(makeInfo({ type: 'iban', refundMethodCode: 'iban' }))).toBe(false);
  });

  it('detects a gift voucher from the type', () => {
    expect(isGiftVoucherRefund(makeInfo({ type: 'gift_voucher' }))).toBe(true);
  });

  it('detects a gift voucher from the refund method code alone', () => {
    expect(isGiftVoucherRefund(makeInfo({ refundMethodCode: 'gift_voucher' }))).toBe(true);
  });
});
