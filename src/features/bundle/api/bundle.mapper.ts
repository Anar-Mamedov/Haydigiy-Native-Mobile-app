/**
 * Bundle DTO → domain model dönüşümleri.
 *
 * Backend alan adları uçtan uca sabit olmadığı için okuyucular birkaç olası anahtarı
 * sırayla dener; hiçbiri yoksa güvenli varsayılan döner. Böylece eksik veri gelen bir
 * paket ekranı çökertmez, yalnızca boş görünür.
 */

import {
  BundleComponentDto,
  BundleDto,
  BundleImageDto,
  BundleItemDto,
  BundleItemVariantDto,
} from './bundle.dtos';
import { BundleComponent, BundleItem, BundleSummary, BundleVariantOption } from '@/types/bundle.types';

/** Bundle satırı stok/limit bilgisi göndermediğinde uygulanan üst adet sınırı. */
export const BUNDLE_MAX_QUANTITY = 10;

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toPositiveInt(value: unknown, fallback = 0): number {
  const parsed = Math.trunc(toNumber(value));
  return parsed > 0 ? parsed : fallback;
}

function toText(value: unknown): string | null {
  if (typeof value === 'string' && value.trim() !== '') return value.trim();
  if (typeof value === 'number') return String(value);
  return null;
}

/** Görsel düz string ya da `{ thumb, medium, large }` nesnesi olarak gelebilir. */
function readImageUrl(...sources: (BundleImageDto | undefined)[]): string {
  for (const source of sources) {
    if (typeof source === 'string' && source.trim() !== '') return source;
    if (source && typeof source === 'object') {
      const url = source.thumb ?? source.medium ?? source.large;
      if (typeof url === 'string' && url.trim() !== '') return url;
    }
  }
  return '';
}

function readVariant(dto: BundleItemVariantDto, index: number): BundleVariantOption | null {
  /**
   * Sepete gönderilecek id ürüne ÖZEL olan `product_variant_id`'dir. Kalemlerin
   * `variant_id` alanı bedenin global tanımıdır ve farklı ürünlerde tekrar eder
   * (üç ayrı üründe L bedeni de `variant_id: 233`), bu yüzden hangi ürünün bedeni
   * olduğunu ayırt edemez. Normal ürün akışında da sepete pivot id gönderiliyor.
   */
  const variantId = toPositiveInt(dto.product_variant_id ?? dto.id ?? dto.variant_id);
  if (!variantId) return null;

  const stock = Math.max(0, Math.trunc(toNumber(dto.quantity)));
  // Backend `is_available: false` derse stok sayısına bakılmaksızın beden seçilemez.
  const isUnavailable = dto.is_available === false;
  const availableStock = isUnavailable ? 0 : stock;

  return {
    key: `${variantId}-${index}`,
    variantId: String(variantId),
    name: toText(dto.name) ?? '-',
    name2: toText(dto.name_2),
    stock: availableStock,
    hasStock: availableStock > 0,
  };
}

function readBundleItem(dto: BundleItemDto, index: number): BundleItem | null {
  const bundleItemId = toPositiveInt(dto.bundle_item_id ?? dto.id);
  if (!bundleItemId) return null;

  const product = dto.product ?? {};
  const variants = (dto.variants ?? [])
    .map(readVariant)
    .filter((variant): variant is BundleVariantOption => variant !== null);

  const price = toNumber(dto.regular_line_total ?? product.price);

  return {
    bundleItemId,
    productId: toPositiveInt(product.id ?? dto.component_product_id) || null,
    title: toText(product.name) ?? `Ürün ${index + 1}`,
    slug: toText(product.slug),
    imageUrl: readImageUrl(product.image, product.medias?.[0]),
    price,
    oldPrice: null,
    quantity: toPositiveInt(dto.quantity, 1),
    // Backend kalemi satılamaz işaretlerse beden seçimi açılmaz.
    isAvailable: dto.is_available !== false && variants.some((variant) => variant.hasStock),
    variants,
  };
}

/** Ürün detayındaki paket kalemlerini domain modeline çevirir. */
export function mapBundleItems(bundle: BundleDto | null | undefined): BundleItem[] {
  const rawItems = bundle?.items ?? [];
  return rawItems.map(readBundleItem).filter((item): item is BundleItem => item !== null);
}

/**
 * Paket fiyat özeti. Backend `regular_total` ve `saving_amount` gönderiyorsa onlar
 * esas alınır; göndermiyorsa kalem fiyatlarından hesaplanır.
 */
export function mapBundleSummary(
  items: BundleItem[],
  bundle: BundleDto | null | undefined,
  options?: { isApprovedForSale?: boolean },
): BundleSummary {
  const bundlePrice = toNumber(bundle?.price);

  const computedTotal = items.reduce((sum, item) => sum + item.price * Math.max(1, item.quantity), 0);
  const reportedTotal = toNumber(bundle?.regular_total);
  const itemsTotal = reportedTotal > 0 ? reportedTotal : computedTotal;

  const savings =
    bundle?.saving_amount !== undefined && bundle?.saving_amount !== null
      ? Math.max(0, toNumber(bundle.saving_amount))
      : Math.max(0, itemsTotal - bundlePrice);

  return {
    itemCount: items.length,
    itemsTotal,
    bundlePrice,
    savings,
    savingsPercent: savings > 0 && itemsTotal > 0 ? Math.round((savings / itemsTotal) * 100) : 0,
    // Backend paketi satılamaz işaretlediyse sepete ekleme tamamen kapanır.
    isSellable: bundle?.is_sellable !== false && options?.isApprovedForSale !== false,
    maxQuantity: toPositiveInt(bundle?.max_quantity, BUNDLE_MAX_QUANTITY),
  };
}

/**
 * Sepet / ödeme / sipariş cevaplarındaki paket bileşenlerini domain modeline çevirir.
 * Bileşen adı uca göre `name` ya da `product_name` olarak gelir.
 */
export function mapBundleComponents(dtos: BundleComponentDto[] | null | undefined): BundleComponent[] {
  if (!Array.isArray(dtos)) return [];

  return dtos.map((dto, index) => {
    const orderItemId = toPositiveInt(dto.order_item_id);

    return {
      key: String(dto.order_item_id ?? dto.id ?? dto.variant_id ?? index),
      orderItemId: orderItemId || null,
      title: toText(dto.name) ?? toText(dto.product_name) ?? 'Ürün',
      slug: toText(dto.slug) ?? toText(dto.product_slug),
      imageUrl: readImageUrl(dto.image),
      variantName: toText(dto.variant_name) ?? toText(dto.variant?.name) ?? toText(dto.variant?.size?.name),
      quantity: toPositiveInt(dto.quantity, 1),
      price: (() => {
        const price = toNumber(dto.unit_price ?? dto.price ?? dto.line_total);
        return price > 0 ? price : null;
      })(),
    };
  });
}

/** Satır bundle mı? (sepet, ödeme ve sipariş görünümlerinde) */
export function isBundleLine(line: { item_type?: string | null; bundle_group_id?: string | null } | null | undefined): boolean {
  if (!line) return false;
  return line.item_type === 'bundle' || Boolean(line.bundle_group_id);
}
