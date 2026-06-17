import { getCartDiscountCampaignTotal, getFreeShippingCampaign } from './cart-campaigns';
import { CartCampaign } from '@/types/cart.types';

const NOW = new Date('2026-06-17T00:00:00Z').getTime();

function freeShipping(overrides: Partial<CartCampaign> = {}): CartCampaign {
  return {
    id: 1,
    name: 'Ücretsiz Kargo',
    type: 'free_shipping',
    isApplicable: false,
    threshold: 500,
    remaining: 0,
    endDate: null,
    ...overrides,
  };
}

describe('getFreeShippingCampaign', () => {
  it('reports remaining amount and progress below the threshold', () => {
    const status = getFreeShippingCampaign([freeShipping()], 200, NOW);
    expect(status?.remaining).toBe(300);
    expect(status?.isApplicable).toBe(false);
    expect(status?.progress).toBeCloseTo(40);
  });

  it('marks the campaign applicable once the subtotal reaches the threshold', () => {
    const status = getFreeShippingCampaign([freeShipping()], 500, NOW);
    expect(status?.isApplicable).toBe(true);
    expect(status?.remaining).toBe(0);
    expect(status?.progress).toBe(100);
  });

  it('treats an expired campaign as not applicable', () => {
    const expired = freeShipping({ endDate: '2026-01-01T00:00:00Z' });
    const status = getFreeShippingCampaign([expired], 500, NOW);
    expect(status?.isApplicable).toBe(false);
  });

  it('returns null when there is no free-shipping campaign', () => {
    expect(getFreeShippingCampaign([], 500, NOW)).toBeNull();
  });
});

describe('getCartDiscountCampaignTotal', () => {
  const discount = (overrides: Partial<CartCampaign> = {}): CartCampaign => ({
    id: 2,
    name: 'Sepet İndirimi',
    type: 'cart_discount',
    isApplicable: true,
    threshold: 300,
    remaining: 0,
    discount: 50,
    endDate: null,
    ...overrides,
  });

  it('sums applicable cart-discount campaigns above the threshold', () => {
    expect(getCartDiscountCampaignTotal([discount()], 400, NOW)).toBe(50);
  });

  it('ignores campaigns whose threshold is not met', () => {
    expect(getCartDiscountCampaignTotal([discount()], 100, NOW)).toBe(0);
  });

  it('ignores expired cart-discount campaigns', () => {
    expect(
      getCartDiscountCampaignTotal([discount({ endDate: '2026-01-01T00:00:00Z' })], 400, NOW),
    ).toBe(0);
  });
});
