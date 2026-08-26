import { useQuery } from '@tanstack/react-query';
import { insiderKeys } from './insider.keys';
import {
  InsiderRecommendationSlot,
  getInsiderRecommendationId,
} from '../config/recommendation-campaigns';
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
  slot: InsiderRecommendationSlot;
  /** Ürün bazlı algoritmalar için; verildiğinde `getSmartRecommendationWithProduct` kullanılır. */
  product?: InsiderProductInput | null;
  /** Kimlik bazlı algoritmalar için; ilk üç kimlik gönderilir. */
  productIds?: string[];
  /** Ekranın kendi hazır olma koşulu (veri yüklendi, sekme odakta vb.). */
  enabled?: boolean;
};

function buildReference(params: InsiderRecommendationQueryParams): string {
  if (params.product) return `product:${params.product.id}`;
  if (params.productIds?.length) {
    return `ids:${params.productIds.slice(0, MAX_RECOMMENDATION_PRODUCT_IDS).join(',')}`;
  }
  return 'none';
}

/**
 * Smart Recommender sonucunu getirir. Kampanya ID'si tanımlı değilse ya da ürün bazlı
 * istek için gereken girdi henüz yoksa sorgu hiç çalışmaz — SDK boşuna çağrılmaz.
 *
 * Servis hata fırlatmaz, en kötü durumda boş sonuç döner; öneri alanı ekranı kırmaz.
 */
export function useInsiderRecommendationQuery(params: InsiderRecommendationQueryParams) {
  const { slot, product, productIds, enabled = true } = params;
  const recommendationId = getInsiderRecommendationId(slot);
  const reference = buildReference(params);

  const hasRequiredInput =
    slot === 'productDetail'
      ? Boolean(product)
      : slot === 'cart'
        ? Boolean(productIds?.length)
        : true;

  return useQuery<InsiderRecommendation>({
    queryKey: insiderKeys.recommendation(slot, recommendationId ?? 0, reference),
    queryFn: () => {
      if (recommendationId === null) return Promise.resolve(EMPTY_INSIDER_RECOMMENDATION);
      if (product) return insiderRecommender.fetchRecommendationForProduct(recommendationId, product);
      if (productIds?.length) {
        return insiderRecommender.fetchRecommendationForProductIds(recommendationId, productIds);
      }
      return insiderRecommender.fetchRecommendation(recommendationId);
    },
    enabled: enabled && recommendationId !== null && hasRequiredInput,
    staleTime: RECOMMENDATION_STALE_TIME_MS,
  });
}
