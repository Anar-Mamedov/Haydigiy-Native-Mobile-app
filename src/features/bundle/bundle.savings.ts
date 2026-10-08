import { BundleItem, BundleSummary } from '@/types/bundle.types';
import { Product } from '@/types/product.types';
import { getDiscountPercent, isDisplayableDiscountPercent } from '@/utils/discount-threshold';

/** Paket kazancının ekranda nasıl gösterileceğini belirleyen türetilmiş model. */
export type BundleSavings = {
  /**
   * Paket, ürünlerin tek tek toplamından indirim sayılacak kadar ucuz mu. Yanlışsa paket
   * kutuları yeşil indirim düzeni yerine turuncu normal fiyat düzenine döner (web ile aynı).
   */
  hasSavings: boolean;
  /** Rozette gösterilebilir indirim yüzdesi; gösterilemiyorsa `undefined`. */
  discountRate?: number;
};

/**
 * Paket özetini "kazanç gösterilsin mi" kararına indirger.
 *
 * Kural tek yerde durur: paket ucuz değilse ya da kazanç %3'ü geçmiyorsa (web'deki
 * `savings > 0 && savingsPercent > 3`) ne üstü çizili toplam, ne "Kazancın" etiketi ne de
 * yüzde rozeti çizilir — kullanıcıya indirim sayılmayan bir fark vaat edilmez. Backend
 * tutarsız bir oran gönderse bile ekranda "%0" ya da dayanaksız bir indirim iddiası oluşmaz.
 */
export function resolveBundleSavings(summary: BundleSummary): BundleSavings {
  const rate = summary.savingsPercent;
  const hasSavings = summary.savings > 0 && isDisplayableDiscountPercent(rate);

  return {
    discountRate: hasSavings ? rate : undefined,
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
 * yoksa, paket fiyatından yüksek değilse ya da kazanç %3'ü geçmiyorsa null döner ve kart normal
 * fiyatını gösterir (web `getListingBundlePrice` ve detaydaki paket kutusuyla aynı eşik).
 */
export function resolveBundleListingSavings(
  product: Pick<Product, 'isBundle' | 'price' | 'bundleItemsTotal'>,
): BundleListingSavings | null {
  const itemsTotal = product.bundleItemsTotal;
  if (!product.isBundle || itemsTotal === undefined || !Number.isFinite(itemsTotal)) return null;
  if (!(product.price > 0) || itemsTotal <= product.price) return null;

  const savingsPercent = getDiscountPercent(itemsTotal, product.price);
  return isDisplayableDiscountPercent(savingsPercent) ? { itemsTotal, savingsPercent } : null;
}
