import { InsiderPayload } from '../types/insider.types';
import { DEFAULT_INSIDER_TAXONOMY, InsiderProductInput } from './insider-product.mapper';

/**
 * Smart Recommender yanıtındaki bir ürün. Alanlar Insider feed'inden geldiği için
 * hepsi opsiyonel kabul edilir; yalnızca `id` ve `name` zorunludur.
 */
export type InsiderRecommendedProduct = {
  /** Insider `item_id`. Tıklama/sepet/satın alma eşleşmesi bu kimlik üzerinden yapılır. */
  id: string;
  name: string;
  imageUrl: string | null;
  /** Ürün detayına yönlendirmek için kullanılan tam URL (`.../product/{slug}`). */
  url: string | null;
  brand: string | null;
  /** Geçerli satış fiyatı; para birimi anahtarından okunur. */
  price: number | null;
  /** İndirim öncesi fiyat, yalnızca gerçekten indirimliyse dolu. */
  originalPrice: number | null;
  inStock: boolean;
  taxonomy: string[];
};

export type InsiderRecommendation = {
  products: InsiderRecommendedProduct[];
  /**
   * Kampanya `details: false` ile kurulduğunda yanıt yalnızca kimlik listesi döner.
   * Bu durumda ürün bilgisi çağıran tarafın kendi verisinden çözülmelidir.
   */
  productIds: string[];
};

export const EMPTY_INSIDER_RECOMMENDATION: InsiderRecommendation = {
  products: [],
  productIds: [],
};

function toTrimmedString(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

/**
 * Fiyatlar para birimi anahtarlı sözlük olarak geliyor (`{ "TRY": 129.9 }`).
 * Beklenen anahtar yoksa sözlükteki ilk geçerli değere düşülür; feed farklı bir
 * anahtar kullandığında slider fiyatsız kalmasın.
 */
function readPrice(value: unknown, currency: string): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  if (!value || typeof value !== 'object') return null;

  const entries = Object.entries(value as Record<string, unknown>);
  const preferred = entries.find(([key]) => key.toUpperCase() === currency.toUpperCase());
  const candidates = preferred ? [preferred, ...entries] : entries;

  for (const [, entryValue] of candidates) {
    const parsed = typeof entryValue === 'string' ? Number(entryValue) : entryValue;
    if (typeof parsed === 'number' && Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return null;
}

/** `"Electronics > Smartphones > Apple"` → `['Electronics', 'Smartphones', 'Apple']`. */
function readTaxonomy(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => toTrimmedString(entry)).filter((entry): entry is string => !!entry);
  }

  const raw = toTrimmedString(value);
  if (!raw) return [];

  return raw
    .split('>')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Feed `in_stock` alanını 1/0, "1"/"0" ya da boolean olarak gönderebiliyor. */
function readInStock(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') return value.trim() !== '' && value.trim() !== '0';
  // Alan hiç gelmediyse ürünü stokta kabul et; feed stok taşımıyor olabilir.
  return true;
}

function mapProduct(entry: Record<string, unknown>, currency: string): InsiderRecommendedProduct | null {
  const id = toTrimmedString(entry.item_id);
  const name = toTrimmedString(entry.name);
  if (!id || !name) return null;

  const price = readPrice(entry.price, currency);
  const originalPrice = readPrice(entry.original_price, currency);

  return {
    id,
    name,
    imageUrl: toTrimmedString(entry.image_url),
    url: toTrimmedString(entry.url),
    brand: toTrimmedString(entry.brand),
    price,
    // İndirim yoksa Insider `original_price` alanını fiyatla aynı gönderiyor; çift fiyat gösterme.
    originalPrice:
      originalPrice !== null && price !== null && originalPrice > price ? originalPrice : null,
    inStock: readInStock(entry.in_stock),
    taxonomy: readTaxonomy(entry.product_type),
  };
}

/**
 * Smart Recommender yanıtını domain modeline çevirir.
 *
 * Yanıt iki biçimde gelebilir: `details: true` ile ürün nesneleri, `details: false` ile
 * yalnızca kimlik dizisi. `success` false ise ya da gövde beklenmedikse boş sonuç döner —
 * öneri alanı hiçbir koşulda ekranı kırmamalı.
 */
export function mapInsiderRecommendation(
  payload: InsiderPayload | null | undefined,
  currency: string,
): InsiderRecommendation {
  if (!payload || typeof payload !== 'object') return EMPTY_INSIDER_RECOMMENDATION;
  if (payload.success === false) return EMPTY_INSIDER_RECOMMENDATION;

  const data = payload.data;
  if (!Array.isArray(data)) return EMPTY_INSIDER_RECOMMENDATION;

  const products: InsiderRecommendedProduct[] = [];
  const productIds: string[] = [];

  data.forEach((entry) => {
    if (typeof entry === 'string' || typeof entry === 'number') {
      const id = toTrimmedString(entry);
      if (id) productIds.push(id);
      return;
    }

    if (!entry || typeof entry !== 'object') return;

    const product = mapProduct(entry as Record<string, unknown>, currency);
    if (product) {
      products.push(product);
      productIds.push(product.id);
    }
  });

  return { products, productIds };
}

/**
 * Önerilen ürünü tracker girdisine çevirir.
 *
 * Tıklama, sepete ekleme ve satın alma istatistiklerinin panelde eşleşmesi için üçünde de
 * aynı ürün kimliği kullanılmalı; kimlik doğrudan Insider'ın `item_id` alanıdır.
 */
export function recommendedProductToInsiderInput(
  product: InsiderRecommendedProduct,
  currency: string,
): InsiderProductInput {
  // Insider `price` alanını liste fiyatı, `salePrice` alanını indirimli fiyat olarak bekliyor.
  const listPrice = product.originalPrice ?? product.price ?? 0;
  const salePrice = product.originalPrice !== null ? (product.price ?? undefined) : undefined;

  return {
    id: product.id,
    name: product.name,
    taxonomy: product.taxonomy.length > 0 ? product.taxonomy : [...DEFAULT_INSIDER_TAXONOMY],
    imageUrl: product.imageUrl ?? '',
    price: listPrice,
    salePrice,
    currency,
    brand: product.brand ?? undefined,
    stock: product.inStock ? 1 : 0,
    productUrl: product.url ?? undefined,
  };
}

/**
 * Ürün detayına yönlendirmek için kullanılacak yol parçası.
 *
 * Feed'deki `url` (`https://haydigiy.com/product/{slug}`) varsa slug tercih edilir; ürün
 * rotası slug ile de kimlik ile de çalışır, slug daha okunur bir derin bağlantı üretir.
 */
export function getRecommendedProductRouteParam(product: InsiderRecommendedProduct): string {
  const url = product.url?.trim();
  if (url) {
    const withoutQuery = url.split(/[?#]/)[0];
    const slug = withoutQuery.split('/').filter(Boolean).pop();
    if (slug && slug !== 'product') return slug;
  }

  return product.id;
}
