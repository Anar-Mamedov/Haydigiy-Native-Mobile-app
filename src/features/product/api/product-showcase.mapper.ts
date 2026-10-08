import { parsePrice } from '@/features/checkout/utils/parse-price';
import {
  ProductShowcaseContent,
  ProductShowcaseProductItem,
} from '@/types/page-design.types';
import { resolveDeepLinkPath } from '@/utils/resolve-deep-link';

/** Ana sayfa vitrinindeki ("Öne Çıkanlar", "Yeni Gelenler") tek ürün. */
export type ShowcaseProduct = {
  id: string;
  /** Ürün detayı için slug; URL'den çözülemezse boş, o zaman `id` ile açılır. */
  slug: string;
  title: string;
  imageUrl: string | null;
  price: number;
  firstPrice?: number;
  hasDiscount: boolean;
  discountRate?: number;
};

export type ProductShowcase = {
  title: string;
  subtitle: string;
  /** "Tümünü Gör" bağlantısı; ikisi de doluysa gösterilir. */
  ctaLabel: string;
  ctaLink: string;
  products: ShowcaseProduct[];
};

const PRODUCT_ROUTE_PREFIX = '/product/';
const FALLBACK_TITLE = 'Ürün';

/** "₺1.219,99" gibi para birimi işaretli metni sayıya çevirir. */
function toPrice(value: string | number | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  return parsePrice((value ?? '').replace(/[^\d.,]/g, ''));
}

/** Web ürün URL'ini (`haydigiy.com/{slug}`) uygulamadaki deep link kurallarıyla slug'a çevirir. */
function toSlug(url: string | undefined): string {
  if (!url || url === '#') return '';
  const path = resolveDeepLinkPath(url);
  return path.startsWith(PRODUCT_ROUTE_PREFIX) ? path.slice(PRODUCT_ROUTE_PREFIX.length) : '';
}

function toId(value: number | string | undefined): string {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? String(value) : '';
  return value?.trim() ?? '';
}

function mapShowcaseProduct(item: ProductShowcaseProductItem): ShowcaseProduct | null {
  const id = toId(item.id);
  const slug = toSlug(item.url || item.link);
  // Ne kimliği ne slug'ı olan ürün açılamaz ve sepete eklenemez.
  if (!id && !slug) return null;

  const price = toPrice(item.price);
  const firstPrice = toPrice(item.first_price);
  const hasDiscount = Boolean(item.has_discount || (firstPrice > price && firstPrice > 0));
  const discountRate =
    item.discount_rate ||
    (hasDiscount && firstPrice > 0 ? Math.round(((firstPrice - price) / firstPrice) * 100) : undefined);

  return {
    id,
    slug,
    title: item.name || item.title || FALLBACK_TITLE,
    imageUrl: item.image || null,
    price,
    firstPrice: firstPrice > 0 ? firstPrice : undefined,
    hasDiscount,
    discountRate,
  };
}

/**
 * `product_showcase` bölümünü ekranın kullanacağı modele indirger. Web
 * (`MobileProductShowcase`) ile aynı geri düşme sırası: bölüm alanları, yoksa
 * eski panel kayıtlarındaki `items[0]`.
 */
export function mapProductShowcaseContent(content: ProductShowcaseContent | null | undefined): ProductShowcase {
  const source = content ?? {};
  const legacy = Array.isArray(source.items) ? (source.items[0] ?? {}) : {};

  const rawProducts =
    Array.isArray(source.products) && source.products.length > 0
      ? source.products
      : Array.isArray(legacy.products)
        ? legacy.products
        : [];

  return {
    title: source.title ?? legacy.text ?? '',
    subtitle: source.subtitle ?? legacy.subtitle ?? '',
    ctaLabel: source.button_text ?? legacy.button_text ?? '',
    ctaLink: source.button_link || legacy.link || source.link || '',
    products: rawProducts
      .map(mapShowcaseProduct)
      .filter((product): product is ShowcaseProduct => product !== null),
  };
}

/** Ürün detayı rotası `slug` ile açılırsa ek id→slug isteği yapılmaz. */
export function getShowcaseProductKey(product: Pick<ShowcaseProduct, 'id' | 'slug'>): string {
  return product.slug || product.id;
}
