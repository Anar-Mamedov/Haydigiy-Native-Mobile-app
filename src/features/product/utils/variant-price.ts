/**
 * Beden (varyant) bazlı fiyat kuralları. Backend her beden için ayrı fiyat dönebilir;
 * fiyatı boş gelen beden ürünün varsayılan fiyatıyla satılır.
 */

import { Product, ProductSize, ProductVariant } from '@/types/product.types';
import { resolveProductDiscount } from './product-price';

/** Fiyat kutularının ihtiyaç duyduğu alanlar; ürün modelindeki adlarla aynıdır. */
export type ProductPricing = Pick<Product, 'discountRate' | 'firstPrice' | 'hasDiscount' | 'price'>;

/** Beden rozetinin oranı hesaplarken baktığı, ürünün bedene özel olmayan fiyatları. */
export type ProductBasePricing = Pick<ProductPricing, 'firstPrice' | 'price'>;

export type SizeSpecialPrice = {
  /** Aynı özel fiyattan satılan, stokta olan bedenler. */
  sizeNames: string[];
  price: number;
};

/** Bedenin kendi fiyatı var mı? Boş ya da 0 gelen fiyat "bedene özel fiyat yok" demektir. */
export function hasOwnVariantPrice(price: number | null | undefined): price is number {
  return typeof price === 'number' && Number.isFinite(price) && price > 0;
}

/** `basePrice`'tan `price`'a yüzde kaç indirim olduğu; backend'in ürün indirimi formülü. */
function discountRateFrom(basePrice: number, price: number): number {
  return Math.round(((basePrice - price) / basePrice) * 100);
}

/**
 * Beden fiyatındaki indirimin tabanı: `first_price` beden fiyatından yüksekse odur, değilse
 * taban yoktur. Fiyat kutusu da beden rozeti de bu tek kuralı kullanır; aynı beden için ikisi
 * farklı oran gösteremez.
 */
function resolveFirstPriceBase(firstPrice: number | undefined, variantPrice: number): number | undefined {
  return firstPrice !== undefined && firstPrice > variantPrice ? firstPrice : undefined;
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

  const discountBase = resolveFirstPriceBase(firstPrice, variantPrice);

  return {
    discountRate: discountBase !== undefined ? discountRateFrom(discountBase, variantPrice) : undefined,
    firstPrice,
    hasDiscount: discountBase !== undefined,
    price: variantPrice,
  };
}

/**
 * Beden çipindeki indirim rozeti: bedenin kendi fiyatı ürünün varsayılan fiyatından düşükse, o
 * beden seçilince fiyat kutusunun göstereceği toplam indirim. Ürün zaten indirimliyse bedenin ek
 * indirimi indirimli fiyata göre ayrıca yüzdelenmez, `first_price`'tan okunur (209,99 TL'lik,
 * %5 indirimle 199,99 TL'ye düşen üründe 159,99 TL'lik beden için %20 değil %24). Fiyat kutusu
 * indirim göstermeyecekse oran ürünün fiyatından çıkar (339,99 → 269,99 için %21).
 * Bedenin kendi fiyatı yoksa, ucuz değilse ya da fark yuvarlanınca %0'a düşüyorsa `undefined`.
 * Stok ve satış durumu çağıranın kararıdır: rozet yalnızca alınabilen bedende gösterilmeli.
 */
export function resolveVariantDiscountRate(
  variantPrice: number | null | undefined,
  product: ProductBasePricing | null | undefined,
): number | undefined {
  const productPrice = product?.price;
  if (!hasOwnVariantPrice(variantPrice) || !hasOwnVariantPrice(productPrice) || variantPrice >= productPrice) {
    return undefined;
  }

  const basePrice = resolveFirstPriceBase(product?.firstPrice, variantPrice) ?? productPrice;
  const rate = discountRateFrom(basePrice, variantPrice);
  return rate > 0 ? rate : undefined;
}

/**
 * Beden çipindeki indirim rozeti: o beden seçilince fiyat kutusunda görünecek indirim. Bedene özel
 * ucuz fiyatı olan beden kendi toplam indirimini (`resolveVariantDiscountRate`), diğer bedenler
 * ürünün genel indirimini gösterir; bedenler arasındaki fark çiplerden okunur (S %24, L %5). Ürünün
 * genel indirimi yoksa bedene özel fiyatı olmayan beden rozetsiz kalır.
 * Stok ve satış durumu çağıranın kararıdır: rozet yalnızca alınabilen bedende gösterilmeli.
 */
export function resolveSizeBadgeRate(
  variant: Pick<ProductVariant, 'price'>,
  product: ProductPricing | null | undefined,
): number | undefined {
  if (!product) return undefined;

  return (
    resolveVariantDiscountRate(variant.price, product) ??
    resolveProductDiscount(resolveVariantPricing(product, variant)).discountRate
  );
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
