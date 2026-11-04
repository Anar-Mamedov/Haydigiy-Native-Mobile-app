import { isGiftVoucherRefund } from './refund-method';
import { ReturnPaymentInfo } from '@/types/order.types';

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
