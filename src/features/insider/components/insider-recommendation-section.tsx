import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { InsiderRecommendationSlider } from './insider-recommendation-slider';
import { useInsiderRecommendationQuery } from '../api/insider-recommendation.queries';
import {
  InsiderRecommendationSlot,
  getInsiderRecommendationCampaign,
  getInsiderRecommendationId,
} from '../config/recommendation-campaigns';
import { insiderTracker } from '../services/insider-tracker';
import { InsiderProductInput } from '../utils/insider-product.mapper';
import { INSIDER_CURRENCY } from '../utils/insider-locale';
import {
  InsiderRecommendedProduct,
  getRecommendedProductRouteParam,
  recommendedProductToInsiderInput,
} from '../utils/insider-recommendation.mapper';

type InsiderRecommendationSectionProps = {
  slot: InsiderRecommendationSlot;
  /** `productDetail` slotu için görüntülenen ürün. */
  product?: InsiderProductInput | null;
  /** `cart` slotu için sepetteki ürün kimlikleri; ilk üçü kullanılır. */
  productIds?: string[];
  /** Ekranın kendi hazır olma koşulu (veri yüklendi, ekran odakta vb.). */
  enabled?: boolean;
};

/**
 * Bir Smart Recommender kampanyasını ekrana bağlar: veriyi çeker, tıklamayı Insider'a
 * loglar ve ürün detayına yönlendirir.
 *
 * Kampanya panelde tanımlı değilse (`config/recommendation-campaigns.ts` içinde `id: null`)
 * hiçbir şey render edilmez ve SDK hiç çağrılmaz; ekranlara güvenle eklenebilir.
 */
export function InsiderRecommendationSection({
  slot,
  product,
  productIds,
  enabled,
}: InsiderRecommendationSectionProps) {
  const router = useRouter();
  const campaign = getInsiderRecommendationCampaign(slot);
  const recommendationId = getInsiderRecommendationId(slot);

  const query = useInsiderRecommendationQuery({ slot, product, productIds, enabled });

  const handleProductPress = useCallback(
    (recommended: InsiderRecommendedProduct) => {
      // Sıra kritik: tıklama, sepete ekleme ve satın alma istatistiklerinin ön koşulu.
      if (recommendationId !== null) {
        insiderTracker.trackRecommendationClick(
          recommendationId,
          recommendedProductToInsiderInput(recommended, INSIDER_CURRENCY),
        );
      }
      router.push(`/product/${getRecommendedProductRouteParam(recommended)}` as never);
    },
    [recommendationId, router],
  );

  if (recommendationId === null) return null;

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
