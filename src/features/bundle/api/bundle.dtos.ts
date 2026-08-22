/**
 * Bundle (paket / set) ham API şekilleri.
 *
 * Alan adları uçtan uca birebir aynı değil: ürün detayı `bundle.items[]`, sepet
 * `bundle.components[]`, sipariş listesi ise `products[].components[]` döndürüyor ve
 * bileşen adı yer yer `name`, yer yer `product_name` olarak geliyor. Mapper bu
 * varyasyonları tek domain modeline indirir; DTO'lar bu yüzden gevşek yazılmıştır.
 */

/** Görsel bazı uçlarda düz string, bazılarında `{ thumb, medium }` nesnesi olarak gelir. */
export type BundleImageDto =
  | string
  | {
      id?: number;
      thumb?: string | null;
      medium?: string | null;
      large?: string | null;
    }
  | null;

export interface BundleItemVariantDto {
  id?: number | string;
  /** Ürüne özel varyant satırı — sepete gönderilecek `variant_id` budur. */
  product_variant_id?: number | string;
  /** Bedenin GLOBAL tanımı; farklı ürünlerde tekrar eder, seçim için kullanılamaz. */
  variant_id?: number | string;
  name?: string | null;
  name_2?: string | null;
  quantity?: number | string;
  is_available?: boolean;
  max_bundle_quantity?: number | string;
}

export interface BundleItemProductDto {
  id?: number;
  name?: string | null;
  slug?: string | null;
  price?: number | string;
  image?: BundleImageDto;
  medias?: { thumb?: string | null; medium?: string | null }[] | null;
}

export interface BundleItemDto {
  /** `selections[].bundle_item_id` olarak gönderilir. */
  id?: number;
  bundle_item_id?: number;
  component_product_id?: number;
  quantity?: number | string;
  /** Ürünün paket dışındaki normal satır tutarı. */
  regular_line_total?: number | string;
  bundle_unit_price?: number | string;
  is_available?: boolean;
  max_quantity?: number | string;
  product?: BundleItemProductDto | null;
  variants?: BundleItemVariantDto[] | null;
}

/** Ürün detayındaki `bundle` nesnesi. */
export interface BundleDto {
  id?: number;
  name?: string | null;
  slug?: string | null;
  price?: number | string;
  /** Ürünlerin ayrı ayrı toplamı. */
  regular_total?: number | string;
  /** Backend'in hesapladığı kazanç. */
  saving_amount?: number | string;
  is_sellable?: boolean;
  max_quantity?: number | string;
  image?: BundleImageDto;
  items?: BundleItemDto[] | null;
  components?: BundleComponentDto[] | null;
}

/**
 * Sepet / sipariş cevaplarındaki paket bileşeni.
 * Ad ve slug uca göre `name`/`slug` ya da `product_name`/`product_slug` gelir.
 */
export interface BundleComponentDto {
  id?: number;
  order_item_id?: number;
  bundle_item_id?: number;
  product_id?: number;
  name?: string | null;
  product_name?: string | null;
  slug?: string | null;
  product_slug?: string | null;
  variant_id?: number;
  variant_name?: string | null;
  variant?: { name?: string | null; size?: { name?: string | null } | null } | null;
  quantity?: number | string;
  quantity_per_bundle?: number | string;
  bundle_quantity?: number | string;
  price?: number | string;
  unit_price?: number | string;
  line_total?: number | string;
  image?: BundleImageDto;
}

/** Sepet / ödeme / sipariş satırlarına bundle için eklenen alanlar. */
export interface BundleLineFieldsDto {
  item_type?: 'product' | 'bundle' | string | null;
  bundle_product_id?: number | null;
  /** Bundle'ın sepetteki kimliği; adet güncelleme ve silme bunun üzerinden yapılır. */
  bundle_group_id?: string | null;
  bundle?: BundleDto | null;
}
