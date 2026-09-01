import { BundleSummary } from '@/types/bundle.types';

/** Paket kazancının ekranda nasıl gösterileceğini belirleyen türetilmiş model. */
export type BundleSavings = {
  /** Paket, ürünlerin tek tek toplamından gerçekten ucuz mu. */
  hasSavings: boolean;
  /** Rozette gösterilebilir indirim yüzdesi; gösterilemiyorsa `undefined`. */
  discountRate?: number;
};

/**
 * Paket özetini "kazanç gösterilsin mi" kararına indirger.
 *
 * Kural tek yerde durur: paket ucuz değilse ne üstü çizili toplam ne de yüzde
 * rozeti çizilir — kullanıcıya olmayan bir indirim vaat edilmez. Yüzde, kazanç
 * olmadan tek başına da gösterilmez; backend tutarsız bir oran gönderse bile
 * ekranda "%0" ya da dayanaksız bir indirim iddiası oluşmaz.
 */
export function resolveBundleSavings(summary: BundleSummary): BundleSavings {
  const hasSavings = summary.savings > 0;
  const rate = summary.savingsPercent;
  const canShowRate = hasSavings && Number.isFinite(rate) && rate > 0;

  return {
    discountRate: canShowRate ? rate : undefined,
    hasSavings,
  };
}
