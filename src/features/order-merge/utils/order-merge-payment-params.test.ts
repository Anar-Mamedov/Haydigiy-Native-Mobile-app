import {
  parseOrderMergePaymentParams,
  toOrderMergePaymentParams,
} from './order-merge-payment-params';
import type { OrderMergeCardSession } from '@/types/order-merge.types';

const SESSION: OrderMergeCardSession = {
  orderToken: 'tok-1',
  parentOrderNo: 'HG100254',
  amount: 249.9,
  installmentCount: 3,
  cargoId: 4,
  paymentMethodId: 1,
};

describe('order merge payment params', () => {
  it('round-trips a session through route params', () => {
    expect(parseOrderMergePaymentParams(toOrderMergePaymentParams(SESSION))).toEqual(SESSION);
  });

  it('reads the first value of repeated params', () => {
    const params = { ...toOrderMergePaymentParams(SESSION), orderToken: ['tok-1', 'tok-2'] };

    expect(parseOrderMergePaymentParams(params)?.orderToken).toBe('tok-1');
  });

  it('defaults a missing or broken installment count to single payment', () => {
    const params = { ...toOrderMergePaymentParams(SESSION), installmentCount: '2.5' };

    expect(parseOrderMergePaymentParams(params)?.installmentCount).toBe(1);
  });

  it.each(['orderToken', 'orderNo', 'amount', 'cargoId', 'paymentMethodId'] as const)(
    'returns null without %s',
    (key) => {
      const params = { ...toOrderMergePaymentParams(SESSION), [key]: '' };

      expect(parseOrderMergePaymentParams(params)).toBeNull();
    },
  );

  it('returns null for a non-positive amount', () => {
    const params = { ...toOrderMergePaymentParams(SESSION), amount: '0' };

    expect(parseOrderMergePaymentParams(params)).toBeNull();
  });
});
