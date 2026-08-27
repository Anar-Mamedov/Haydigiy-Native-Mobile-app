import {
  INSIDER_RECOMMENDATION_CAMPAIGNS,
  InsiderRecommendationSlot,
  getInsiderRecommendationCampaigns,
} from './recommendation-campaigns';

const SLOTS: InsiderRecommendationSlot[] = ['home', 'productDetail', 'cart', 'orderSuccess'];

describe('INSIDER_RECOMMENDATION_CAMPAIGNS', () => {
  /** Paneldeki 7 aktif kampanya (2026-08-26). */
  it('maps every panel campaign exactly once', () => {
    const ids = SLOTS.flatMap((slot) =>
      INSIDER_RECOMMENDATION_CAMPAIGNS[slot].map((campaign) => campaign.id),
    );

    expect(ids.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('places two campaigns on the screens that ask for two', () => {
    expect(INSIDER_RECOMMENDATION_CAMPAIGNS.productDetail).toHaveLength(2);
    expect(INSIDER_RECOMMENDATION_CAMPAIGNS.home).toHaveLength(2);
    expect(INSIDER_RECOMMENDATION_CAMPAIGNS.cart).toHaveLength(2);
    expect(INSIDER_RECOMMENDATION_CAMPAIGNS.orderSuccess).toHaveLength(1);
  });

  /**
   * Metot kampanyanın algoritmasına bağlı: `byProductIds` yalnızca Purchased/Viewed
   * Together destekliyor, `byProduct` ürün bağlamı gerektiriyor.
   */
  it('uses the SDK method each campaign strategy requires', () => {
    expect(INSIDER_RECOMMENDATION_CAMPAIGNS.productDetail[0]).toMatchObject({
      id: 1,
      method: 'byProduct',
    });
    expect(INSIDER_RECOMMENDATION_CAMPAIGNS.productDetail[1]).toMatchObject({
      id: 2,
      method: 'byId',
    });
    expect(INSIDER_RECOMMENDATION_CAMPAIGNS.home[0]).toMatchObject({ id: 3, method: 'byProduct' });
    expect(INSIDER_RECOMMENDATION_CAMPAIGNS.home[1]).toMatchObject({ id: 4, method: 'byId' });
    expect(INSIDER_RECOMMENDATION_CAMPAIGNS.cart[0]).toMatchObject({ id: 5, method: 'byProductIds' });
    expect(INSIDER_RECOMMENDATION_CAMPAIGNS.cart[1]).toMatchObject({ id: 6, method: 'byId' });
    expect(INSIDER_RECOMMENDATION_CAMPAIGNS.orderSuccess[0]).toMatchObject({
      id: 7,
      method: 'byId',
    });
  });

  it('gives every campaign a customer-facing title', () => {
    SLOTS.flatMap((slot) => INSIDER_RECOMMENDATION_CAMPAIGNS[slot]).forEach((campaign) => {
      expect(campaign.title.trim()).not.toBe('');
    });
  });
});

describe('getInsiderRecommendationCampaigns', () => {
  it('returns the campaigns of a slot', () => {
    expect(getInsiderRecommendationCampaigns('cart').map((c) => c.id)).toEqual([5, 6]);
  });

  /** Kampanya panelde kapatılırsa kimliği sıfırlanır; o kayıt hiç çağrılmamalı. */
  it('drops campaigns whose id is no longer valid', () => {
    const original = INSIDER_RECOMMENDATION_CAMPAIGNS.cart[0].id;
    INSIDER_RECOMMENDATION_CAMPAIGNS.cart[0].id = 0;

    expect(getInsiderRecommendationCampaigns('cart').map((c) => c.id)).toEqual([6]);

    INSIDER_RECOMMENDATION_CAMPAIGNS.cart[0].id = original;
  });
});
