import {
  INSIDER_RECOMMENDATION_CAMPAIGNS,
  getInsiderRecommendationCampaign,
  getInsiderRecommendationId,
} from './recommendation-campaigns';

describe('getInsiderRecommendationId', () => {
  it('returns the configured campaign id', () => {
    INSIDER_RECOMMENDATION_CAMPAIGNS.home.id = 12;
    expect(getInsiderRecommendationId('home')).toBe(12);
    INSIDER_RECOMMENDATION_CAMPAIGNS.home.id = null;
  });

  /** Kampanya tanımlı değilken slot hiç render edilmemeli; `0` da "kampanya yok" sayılır. */
  it('treats a missing or non-positive id as "no campaign"', () => {
    INSIDER_RECOMMENDATION_CAMPAIGNS.home.id = null;
    expect(getInsiderRecommendationId('home')).toBeNull();

    INSIDER_RECOMMENDATION_CAMPAIGNS.home.id = 0;
    expect(getInsiderRecommendationId('home')).toBeNull();

    INSIDER_RECOMMENDATION_CAMPAIGNS.home.id = -3;
    expect(getInsiderRecommendationId('home')).toBeNull();

    INSIDER_RECOMMENDATION_CAMPAIGNS.home.id = null;
  });
});

describe('INSIDER_RECOMMENDATION_CAMPAIGNS', () => {
  it('gives every slot a title', () => {
    Object.values(INSIDER_RECOMMENDATION_CAMPAIGNS).forEach((campaign) => {
      expect(campaign.title.trim()).not.toBe('');
    });
  });

  it('resolves a campaign per slot', () => {
    expect(getInsiderRecommendationCampaign('home').title).toBe('Sana Özel Öneriler');
    expect(getInsiderRecommendationCampaign('cart').title).toBe('Sepetini Tamamla');
  });
});
