import { YStack } from 'tamagui';
import { InsiderRecommendationSection } from './insider-recommendation-section';
import {
  InsiderRecommendationSlot,
  getInsiderRecommendationCampaigns,
} from '../config/recommendation-campaigns';
import { InsiderProductInput } from '../utils/insider-product.mapper';

type InsiderRecommendationSectionsProps = {
  slot: InsiderRecommendationSlot;
  /** `byProduct` kampanyaları için ürün bağlamı; diğer kampanyalar yok sayar. */
  product?: InsiderProductInput | null;
  /** `byProductIds` kampanyaları için ürün kimlikleri; diğer kampanyalar yok sayar. */
  productIds?: string[];
  /** Ekranın kendi hazır olma koşulu (veri yüklendi, ekran odakta vb.). */
  enabled?: boolean;
};

/**
 * Bir ekrandaki tüm Smart Recommender kampanyalarını sırayla çizer.
 *
 * Ekran hangi kampanyaların olduğunu bilmez; liste `config/recommendation-campaigns.ts`
 * içindedir. Kampanya kaldırıldığında ya da eklendiğinde ekran dosyalarına dokunulmaz.
 * Sonuç boş dönen kampanya hiçbir şey render etmez (slider kendi içinde boşu gizler).
 */
export function InsiderRecommendationSections({
  slot,
  product,
  productIds,
  enabled,
}: InsiderRecommendationSectionsProps) {
  const campaigns = getInsiderRecommendationCampaigns(slot);
  if (campaigns.length === 0) return null;

  return (
    <YStack width="100%">
      {campaigns.map((campaign) => (
        <InsiderRecommendationSection
          campaign={campaign}
          enabled={enabled}
          key={campaign.id}
          product={product}
          productIds={productIds}
        />
      ))}
    </YStack>
  );
}
