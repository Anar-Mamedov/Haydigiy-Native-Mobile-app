/**
 * Insider sorgu anahtarları. Öneri sonucu kampanya kimliği + isteği belirleyen referansa
 * (ürün kimliği ya da kimlik listesi) göre önbelleklenir.
 */
export const insiderKeys = {
  all: ['insider'] as const,
  recommendations: () => [...insiderKeys.all, 'recommendation'] as const,
  recommendation: (recommendationId: number, reference: string) =>
    [...insiderKeys.recommendations(), recommendationId, reference] as const,
};
