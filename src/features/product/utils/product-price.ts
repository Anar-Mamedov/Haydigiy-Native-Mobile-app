/** Ürün fiyatının ekranda nasıl türetilip biçimlendirileceğini belirleyen saf kurallar. */

export type ProductDiscountInput = {
  /** İndirim yüzdesi (`discount_rate`). */
  discountRate?: number | null;
  /** İndirim öncesi fiyat (`first_price`). */
  firstPrice?: number | null;
  /** Backend indirim bayrağı (`has_discount`). */
  hasDiscount?: boolean | null;
  /** Güncel satış fiyatı. */
  price: number;
};

export type ProductDiscount = {
  /** Gösterilebilir indirim yüzdesi; geçersizse `undefined`. */
  discountRate?: number;
  /** Üstü çizili gösterilecek indirim öncesi fiyat; geçersizse `undefined`. */
  firstPrice?: number;
  /** İndirimli fiyat düzeni kullanılmalı mı. */
  isDiscounted: boolean;
};

function toFiniteNumber(value: number | null | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Backend indirim alanlarını ekranda güvenle kullanılabilecek tek bir modele indirger.
 *
 * `has_discount` tek başına yeterli değildir: oran da indirim öncesi fiyat da
 * kullanılamıyorsa indirimli düzen "-%undefined" gibi bozuk bir çıktı üretirdi, bu
 * yüzden böyle bir durumda normal fiyat düzenine geri düşülür. Aynı şekilde güncel
 * fiyattan yüksek olmayan bir `first_price` üstü çizili gösterilmez.
 */
export function resolveProductDiscount({
  discountRate,
  firstPrice,
  hasDiscount,
  price,
}: ProductDiscountInput): ProductDiscount {
  const rate = toFiniteNumber(discountRate);
  const previousPrice = toFiniteNumber(firstPrice);
  const currentPrice = toFiniteNumber(price) ?? 0;

  const usableRate = rate !== undefined && rate > 0 ? rate : undefined;
  const usablePreviousPrice =
    previousPrice !== undefined && previousPrice > currentPrice ? previousPrice : undefined;

  const isDiscounted =
    hasDiscount === true && (usableRate !== undefined || usablePreviousPrice !== undefined);

  if (!isDiscounted) {
    return { isDiscounted: false };
  }

  return {
    discountRate: usableRate,
    firstPrice: usablePreviousPrice,
    isDiscounted: true,
  };
}

/**
 * Fiyatın yalnızca sayı kısmını "1.234,56" biçimine çevirir. Para birimini ayrı
 * bir yazı boyutuyla dizen yüzeyler (sticky footer) bu biçimi kullanır.
 */
export function formatProductPriceAmount(value: number | null | undefined): string {
  const amount = toFiniteNumber(value);
  if (amount === undefined) return '';

  return amount.toLocaleString('tr-TR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

/** Ürün fiyatını liste ve detay yüzeylerinin ortak "1.234,56 TL" biçimine çevirir. */
export function formatProductPrice(value: number | null | undefined): string {
  const amount = formatProductPriceAmount(value);
  if (!amount) return '';

  return `${amount} TL`;
}

/** İndirim oranını rozet metnine çevirir (ör. 20 → "-%20"). */
export function formatDiscountRate(rate: number): string {
  return `-%${rate.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
}
