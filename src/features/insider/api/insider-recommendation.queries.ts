import { useQuery } from '@tanstack/react-query';
import { insiderKeys } from './insider.keys';
import { InsiderRecommendationCampaign } from '../config/recommendation-campaigns';
import {
  MAX_RECOMMENDATION_PRODUCT_IDS,
  insiderRecommender,
} from '../services/insider-recommender';
import { InsiderProductInput } from '../utils/insider-product.mapper';
import {
  EMPTY_INSIDER_RECOMMENDATION,
  InsiderRecommendation,
} from '../utils/insider-recommendation.mapper';

/** Öneriler oturum boyunca sabit kalır; her odaklanmada yeniden çekmeye gerek yok. */
const RECOMMENDATION_STALE_TIME_MS = 5 * 60 * 1000;

export type InsiderRecommendationQueryParams = {
  campaign: InsiderRecommendationCampaign;
  /** `byProduct` kampanyaları için ürün bağlamı. */
  product?: InsiderProductInput | null;
  /** `byProductIds` kampanyaları için ürün kimlikleri; ilk üçü gönderilir. */
  productIds?: string[];
  /** Ekranın kendi hazır olma koşulu (veri yüklendi, ekran odakta vb.). */
  enabled?: boolean;
};

function buildReference(params: InsiderRecommendationQueryParams): string {
  if (params.campaign.method === 'byProduct') return `product:${params.product?.id ?? 'none'}`;
  if (params.campaign.method === 'byProductIds') {
    return `ids:${(params.productIds ?? []).slice(0, MAX_RECOMMENDATION_PRODUCT_IDS).join(',')}`;
  }
  return 'none';
}

/** Kampanyanın metodu için gereken girdi hazır mı. */
function hasRequiredInput(params: InsiderRecommendationQueryParams): boolean {
  if (params.campaign.method === 'byProduct') return Boolean(params.product);
  if (params.campaign.method === 'byProductIds') return Boolean(params.productIds?.length);
  return true;
}

/**
 * Smart Recommender sonucunu getirir. Kampanyanın metodu için gereken girdi henüz yoksa
 * sorgu hiç çalışmaz — SDK boşuna çağrılmaz.
 *
 * Servis hata fırlatmaz, en kötü durumda boş sonuç döner; öneri alanı ekranı kırmaz.
 */
export function useInsiderRecommendationQuery(params: InsiderRecommendationQueryParams) {
  const { campaign, product, productIds, enabled = true } = params;

  return useQuery<InsiderRecommendation>({
    queryKey: insiderKeys.recommendation(campaign.id, buildReference(params)),
    queryFn: () => {
      if (campaign.method === 'byProduct') {
        return product
          ? insiderRecommender.fetchRecommendationForProduct(campaign.id, product)
          : Promise.resolve(EMPTY_INSIDER_RECOMMENDATION);
      }

      if (campaign.method === 'byProductIds') {
        return productIds?.length
          ? insiderRecommender.fetchRecommendationForProductIds(campaign.id, productIds)
          : Promise.resolve(EMPTY_INSIDER_RECOMMENDATION);
      }

      return insiderRecommender.fetchRecommendation(campaign.id);
    },
    enabled: enabled && hasRequiredInput(params),
    staleTime: RECOMMENDATION_STALE_TIME_MS,
  });
}
