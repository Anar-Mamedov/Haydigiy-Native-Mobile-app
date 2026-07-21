import { getOrderTokenSummaryError, mapOrderTokenSummary } from './order-token-summary.mapper';
import type { OrderTokenResponseDto } from '@/services/checkout.service';

const response: OrderTokenResponseDto = {
  message: 'Token üretildi.',
  cargo_id: 2,
  payment_method_id: 2,
  subtotal: 399.99,
  user_discount_amount: 0,
  campaign_discount_amount: 0,
  coupon_price: 40,
  cargo_price: 119.99,
  cod_price: 19.99,
  payment_commission_rate: 0,
  payment_fee: 0,
  installment_count: 1,
  interest_amount: 0,
  calculated_total_price: 777.77,
  total_price: 499.97,
  payment_status_id: null,
  coupon: {
    code: 'HG13644',
    discount_type: 'percentage',
    discount: 40,
    is_free_shipping: false,
  },
};

describe('mapOrderTokenSummary', () => {
  it('maps every displayed amount and uses total_price as the total', () => {
    expect(mapOrderTokenSummary(response)).toEqual({
      ok: true,
      summary: {
        subtotal: 399.99,
        userDiscount: 0,
        campaignDiscount: 0,
        couponDiscount: 40,
        cargoPrice: 119.99,
        serviceFee: 19.99,
        commissionRate: 0,
        commission: 0,
        installmentCount: 1,
        installmentFee: 0,
        totalPrice: 499.97,
        isFreeShippingCoupon: false,
      },
    });
  });

  it('reports missing pricing fields instead of deriving them locally', () => {
    const result = mapOrderTokenSummary({
      ...response,
      cargo_price: undefined,
    });

    expect(result).toEqual({ ok: false, missingFields: ['cargo_price'] });
    if (!result.ok) {
      expect(getOrderTokenSummaryError(result.missingFields)).toContain('cargo_price');
    }
  });
});
