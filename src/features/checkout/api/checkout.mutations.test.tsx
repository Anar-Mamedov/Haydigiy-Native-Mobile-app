import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useValidateCouponMutation } from './checkout.mutations';
import * as couponService from '@/services/coupon.service';

jest.mock('@/services/coupon.service', () => ({
  removeCouponDto: jest.fn(async () => undefined),
  validateCouponDto: jest.fn(async () => ({ message: 'ok', valid: true })),
}));

const validateCouponDto = couponService.validateCouponDto as jest.MockedFunction<
  typeof couponService.validateCouponDto
>;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Infinity, retry: false },
      queries: { gcTime: Infinity, retry: false },
    },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useValidateCouponMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('serializes the payment method id as a string for coupon validation', async () => {
    const queryClient = makeQueryClient();
    const { result, unmount } = renderHook(() => useValidateCouponMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync({
      couponCode: 'HG26100',
      paymentMethodId: 1,
      shippingPrice: 19.99,
    });

    expect(validateCouponDto).toHaveBeenCalledWith({
      coupon_code: 'HG26100',
      payment_method_id: '1',
      shipping_price: 19.99,
    });

    unmount();
    queryClient.clear();
  });
});
