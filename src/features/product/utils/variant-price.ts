/**
 * Beden (varyant) bazlı fiyat kuralları. Backend her beden için ayrı fiyat dönebilir;
 * fiyatı boş gelen beden ürünün varsayılan fiyatıyla satılır.
 */

import { Product, ProductSize, ProductVariant } from '@/types/product.types';

/** Fiyat kutularının ihtiyaç duyduğu alanlar; ürün modelindeki adlarla aynıdır. */
export type ProductPricing = Pick<Product, 'discountRate' | 'firstPrice' | 'hasDiscount' | 'price'>;

export type SizeSpecialPrice = {
  /** Aynı özel fiyattan satılan, stokta olan bedenler. */
  sizeNames: string[];
  price: number;
};

/** Bedenin kendi fiyatı var mı? Boş ya da 0 gelen fiyat "bedene özel fiyat yok" demektir. */
export function hasOwnVariantPrice(price: number | null | undefined): price is number {
  return typeof price === 'number' && Number.isFinite(price) && price > 0;
}

/**
 * Detayda gösterilecek fiyat: seçili bedenin kendi fiyatı varsa o, yoksa ürünün varsayılan fiyatı.
 *
 * Beden fiyatındaki indirim, backend'in ürün için kullandığı formülle yeniden hesaplanır:
 * `first_price` beden fiyatından yüksekse indirim vardır ve oran bu iki fiyattan çıkar.
 */
export function resolveVariantPricing(
  product: ProductPricing,
  variant?: Pick<ProductVariant, 'price'> | null,
): ProductPricing {
  const { discountRate, firstPrice, hasDiscount, price } = product;
  const variantPrice = variant?.price;

  if (!hasOwnVariantPrice(variantPrice)) {
    return { discountRate, firstPrice, hasDiscount, price };
  }

  const isDiscounted = firstPrice !== undefined && firstPrice > variantPrice;

  return {
    discountRate: isDiscounted ? Math.round(((firstPrice - variantPrice) / firstPrice) * 100) : undefined,
    firstPrice,
    hasDiscount: isDiscounted,
    price: variantPrice,
  };
}

/**
 * Beden çipindeki indirim rozeti için: bedenin kendi fiyatı ürünün varsayılan fiyatından düşükse
 * yüzde kaç ucuz olduğu (ör. 339,99 → 269,99 için 21; webdeki `getVariantDiscountRate` ile aynı).
 * Bedenin kendi fiyatı yoksa, ucuz değilse ya da fark yuvarlanınca %0'a düşüyorsa `undefined`.
 * Stok ve satış durumu çağıranın kararıdır: rozet yalnızca alınabilen bedende gösterilmeli.
 */
export function resolveVariantDiscountRate(
  variantPrice: number | null | undefined,
  productPrice: number | null | undefined,
): number | undefined {
  if (!hasOwnVariantPrice(variantPrice) || !hasOwnVariantPrice(productPrice) || variantPrice >= productPrice) {
    return undefined;
  }

  const rate = Math.round(((productPrice - variantPrice) / productPrice) * 100);
  return rate > 0 ? rate : undefined;
}

/**
 * Liste kartı için: stokta olup ürünün fiyatından ucuza satılan bedenlerin en düşük fiyatı.
 * Aynı fiyattan satılan bedenler birlikte döner; böyle bir beden yoksa `null` döner.
 */
export function resolveSizeSpecialPrice(
  sizes: ProductSize[] | undefined,
  productPrice: number,
): SizeSpecialPrice | null {
  if (!sizes || !hasOwnVariantPrice(productPrice)) return null;

  let best: SizeSpecialPrice | null = null;

  for (const size of sizes) {
    const sizePrice = size.price;
    const name = size.name?.trim();
    if (!size.hasStock || !name || !hasOwnVariantPrice(sizePrice) || sizePrice >= productPrice) continue;

    if (!best || sizePrice < best.price) {
      best = { sizeNames: [name], price: sizePrice };
    } else if (sizePrice === best.price) {
      best.sizeNames.push(name);
    }
  }

  return best;
}

/** "S bedenine özel", "S ve M bedenlerine özel", "S, M ve L bedenlerine özel" */
export function formatSizeSpecialPriceLabel(sizeNames: string[]): string {
  if (sizeNames.length <= 1) return `${sizeNames[0] ?? ''} bedenine özel`;

  const lastName = sizeNames[sizeNames.length - 1];
  return `${sizeNames.slice(0, -1).join(', ')} ve ${lastName} bedenlerine özel`;
}
