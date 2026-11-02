import { AxiosError, AxiosHeaders } from 'axios';
import { isParentOrderNotEligibleError } from './order-merge-payment-error';

function routerError(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    config,
    data,
    headers: {},
    status,
    statusText: '',
  });
}

describe('isParentOrderNotEligibleError', () => {
  it('recognizes the warehouse lock answer of the payment router', () => {
    const error = routerError(422, {
      status: 'error',
      code: 'parent_order_not_eligible',
      message: 'Maalesef siparişiniz hazırlanmaya başladığı için kabul edilmemektedir.',
    });

    expect(isParentOrderNotEligibleError(error)).toBe(true);
  });

  it('ignores other router errors, network errors and plain errors', () => {
    expect(isParentOrderNotEligibleError(routerError(422, { status: 'error', message: 'Limit aşıldı.' }))).toBe(false);
    expect(isParentOrderNotEligibleError(routerError(500, 'parent_order_not_eligible'))).toBe(false);
    expect(isParentOrderNotEligibleError(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(false);
    expect(isParentOrderNotEligibleError(new Error('parent_order_not_eligible'))).toBe(false);
    expect(isParentOrderNotEligibleError(undefined)).toBe(false);
  });
});
