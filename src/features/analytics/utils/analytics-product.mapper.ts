import { AnalyticsProduct } from '../types/analytics.types';
import { CartLineItem } from '@/types/cart.types';
import { Product } from '@/types/product.types';

/**
 * Domain modellerinden analytics anlık görüntüsü üretir.
 *
 * Insider mapper'ından kasten ayrı: Insider **liste fiyatı + indirimli fiyat**
 * çifti bekler, GA4/Meta/kendi collector'ımız ise kullanıcının o an gördüğü
 * **geçerli fiyatı** ister. İkisini tek mapper'da birleştirmek, iki sağlayıcıdan
 * birinin fiyatını yanlış raporlamak demekti.
 */

const DEFAULT_CURRENCY = 'TRY';

/** Taksonomi yaprağı: alt kategori varsa o, yoksa ana kategori. */
function resolveCategoryName(product: Product): string | undefined {
  const leaf = product.categories?.[product.categories.length - 1];
  return leaf?.trim() || product.category?.trim() || undefined;
}

export function productToAnalyticsProduct(
  product: Product,
  options: { quantity?: number; variantId?: string } = {},
): AnalyticsProduct {
  return {
    id: product.id,
    name: product.title,
    price: product.price,
    currency: product.currency ?? DEFAULT_CURRENCY,
    quantity: options.quantity,
    variantId: options.variantId,
    categoryId: product.categoryId,
    category: resolveCategoryName(product),
    brand: product.brand?.trim() || undefined,
  };
}

export function cartItemToAnalyticsProduct(item: CartLineItem): AnalyticsProduct {
  return {
    id: item.productId,
    name: item.title,
    price: item.unitPrice,
    currency: DEFAULT_CURRENCY,
    quantity: item.quantity,
    variantId: item.variantId,
  };
}

/**
 * Yalnızca kısmi ürün verisi tutan çağrı yerleri (sipariş satırı, favori
 * kaldırma) için. Zorunlu alanlar dışında hiçbir şey uydurulmaz.
 */
export function buildAnalyticsProduct(partial: {
  id: string;
  name: string;
  price: number;
  currency?: string;
  quantity?: number;
  variantId?: string;
  categoryId?: number;
  category?: string;
  brand?: string;
}): AnalyticsProduct {
  return {
    ...partial,
    currency: partial.currency ?? DEFAULT_CURRENCY,
  };
}

/**
 * Sepet/favori mutasyonlarının halihazırda taşıdığı tracking anlık görüntüsünü
 * analytics modeline çevirir.
 *
 * Parametre kasten **yapısal**: `InsiderProductInput` bu şekli sağlıyor ama
 * analytics özelliği Insider özelliğinden hiçbir şey import etmiyor. Böylece
 * mutasyon imzalarına ikinci bir tracking alanı eklemek (ve aynı veriyi iki
 * kez taşımak) gerekmiyor.
 *
 * Fiyat dönüşümü kritik: Insider şeklinde `price` liste fiyatı, `salePrice`
 * indirimli fiyattır. Analytics ise kullanıcının ödediği tutarı ister, bu
 * yüzden indirim varsa o kazanır.
 */
export function trackingSnapshotToAnalyticsProduct(snapshot: {
  id: string;
  name: string;
  price: number;
  currency: string;
  salePrice?: number;
  quantity?: number;
  brand?: string;
  taxonomy?: string[];
}): AnalyticsProduct {
  const leaf = snapshot.taxonomy?.[snapshot.taxonomy.length - 1];

  return {
    id: snapshot.id,
    name: snapshot.name,
    price: typeof snapshot.salePrice === 'number' ? snapshot.salePrice : snapshot.price,
    currency: snapshot.currency || DEFAULT_CURRENCY,
    quantity: snapshot.quantity,
    category: leaf?.trim() || undefined,
    brand: snapshot.brand?.trim() || undefined,
  };
}
