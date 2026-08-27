import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { InsiderRecommendationSlider } from './insider-recommendation-slider';
import { useInsiderRecommendationQuery } from '../api/insider-recommendation.queries';
import { InsiderRecommendationCampaign } from '../config/recommendation-campaigns';
import { insiderTracker } from '../services/insider-tracker';
import { InsiderProductInput } from '../utils/insider-product.mapper';
import { INSIDER_CURRENCY } from '../utils/insider-locale';
import {
  InsiderRecommendedProduct,
  getRecommendedProductRouteParam,
  recommendedProductToInsiderInput,
} from '../utils/insider-recommendation.mapper';

type InsiderRecommendationSectionProps = {
  campaign: InsiderRecommendationCampaign;
  /** `byProduct` kampanyaları için ürün bağlamı. */
  product?: InsiderProductInput | null;
  /** `byProductIds` kampanyaları için ürün kimlikleri; ilk üçü kullanılır. */
  productIds?: string[];
  /** Ekranın kendi hazır olma koşulu (veri yüklendi, ekran odakta vb.). */
  enabled?: boolean;
};

/**
 * Tek bir Smart Recommender kampanyasını çizer: veriyi çeker, tıklamayı Insider'a loglar
 * ve ürün detayına yönlendirir. Bir ekranda birden fazla kampanya varsa
 * `InsiderRecommendationSections` bu bileşeni kampanya başına bir kez render eder.
 */
export function InsiderRecommendationSection({
  campaign,
  product,
  productIds,
  enabled,
}: InsiderRecommendationSectionProps) {
  const router = useRouter();
  const query = useInsiderRecommendationQuery({ campaign, enabled, product, productIds });

  const handleProductPress = useCallback(
    (recommended: InsiderRecommendedProduct) => {
      // Sıra kritik: tıklama, sepete ekleme ve satın alma istatistiklerinin ön koşulu.
      insiderTracker.trackRecommendationClick(
        campaign.id,
        recommendedProductToInsiderInput(recommended, INSIDER_CURRENCY),
      );
      router.push(`/product/${getRecommendedProductRouteParam(recommended)}` as never);
    },
    [campaign.id, router],
  );

  return (
    <InsiderRecommendationSlider
      isError={query.isError}
      isLoading={query.isLoading}
      onProductPress={handleProductPress}
      onRetry={() => {
        void query.refetch();
      }}
      products={query.data?.products ?? []}
      title={campaign.title}
    />
  );
}
