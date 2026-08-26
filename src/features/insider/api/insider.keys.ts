import { InsiderRecommendationSlot } from '../config/recommendation-campaigns';

/**
 * Insider sorgu anahtarları. Öneri sonucu slot + kampanya ID'si + isteği belirleyen
 * referansa (ürün kimliği ya da kimlik listesi) göre önbelleklenir.
 */
export const insiderKeys = {
  all: ['insider'] as const,
  recommendations: () => [...insiderKeys.all, 'recommendation'] as const,
  recommendation: (slot: InsiderRecommendationSlot, recommendationId: number, reference: string) =>
    [...insiderKeys.recommendations(), slot, recommendationId, reference] as const,
};
