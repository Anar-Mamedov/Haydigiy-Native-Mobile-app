import { BundleItem, BundleSummary } from '@/types/bundle.types';
import { Product } from '@/types/product.types';

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

/**
 * Kalemi pakette almanın, tek başına almaya göre kazandırdığı tutar ("Ürünü pakette alırsan
 * X indirim kazanırsın"). İki fiyat da zaten satır toplamı (adet × birim fiyat) olduğu için
 * fark adetle tekrar çarpılmaz. Normal fiyat yoksa ya da paket fiyatından yüksek değilse 0'dır.
 */
export function getBundleItemSavings(item: Pick<BundleItem, 'price' | 'oldPrice'>): number {
  if (item.oldPrice === null || item.oldPrice <= item.price) return 0;
  return item.oldPrice - item.price;
}

/** Liste kartındaki paket kazancı: "-%X" rozeti ve altındaki "Ayrı ayrı alırsan" toplamı. */
export type BundleListingSavings = {
  /** Paketteki ürünlerin tekil fiyat toplamı. */
  itemsTotal: number;
  /** Kazanç yüzdesi (tam sayı). */
  savingsPercent: number;
};

/**
 * Liste kartında paketin kazancını çözer. Liste cevabı paketlerde indirim alanlarını boş gönderir;
 * kazanç, paketteki ürünlerin tekil fiyat toplamı ile paket fiyatının farkıdır. Paket değilse, toplam
 * yoksa ya da paket fiyatından yüksek değilse null döner — kullanıcıya olmayan bir kazanç vaat edilmez.
 * Yuvarlanınca %0'a düşen kazanç da gösterilmez ("-%0" rozeti çıkmasın).
 */
export function resolveBundleListingSavings(
  product: Pick<Product, 'isBundle' | 'price' | 'bundleItemsTotal'>,
): BundleListingSavings | null {
  const itemsTotal = product.bundleItemsTotal;
  if (!product.isBundle || itemsTotal === undefined || !Number.isFinite(itemsTotal)) return null;
  if (!(product.price > 0) || itemsTotal <= product.price) return null;

  const savingsPercent = Math.round(((itemsTotal - product.price) / itemsTotal) * 100);
  return savingsPercent > 0 ? { itemsTotal, savingsPercent } : null;
}
