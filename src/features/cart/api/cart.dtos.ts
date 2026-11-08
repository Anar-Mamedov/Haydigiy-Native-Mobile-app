import { BundleComponentDto, BundleDto } from '@/features/bundle/api/bundle.dtos';

export interface CartItemProductDto {
  id?: number;
  name: string;
  slug: string;
  seller_name?: string;
  /** Backend sepet satırında `color` ilişkisini döndürdüğünde analytics'e taşınır. */
  color?: { name?: string | null } | null;
  color_name?: string | null;
  media?: {
    id?: number;
    thumb?: string;
  } | null;
}

export interface CartItemVariantDto {
  name: string | null;
  stock?: string;
  size?: {
    id: number;
    name: string;
  } | null;
}

export interface CartItemDto {
  /**
   * Sepet satırının kimliği. Aynı varyantın ücretli ve hediye satırları ayrı
   * durduğu için adet güncelleme ve silme bu kimlikle tek satırı hedefler.
   * Bundle satırları bunun yerine `bundle_group_id` ile hedeflenir.
   */
  cart_item_id?: number | null;
  /** Bundle satırlarında gelmez; paket satırı `bundle_group_id` ile tanınır. */
  variant_id: number;
  quantity: number;
  /**
   * Satırdaki ücretsiz kampanya hediyesi adedi. Backend bundle dışı her satırı
   * tek `cart_item_id` ile döndürdüğünden ya 0 ya da satırın tüm adedidir.
   */
  gift_quantity?: number | null;
  old_price: string | null;
  price: string;
  discounted_price?: string | null;
  current_price: string;
  current_discounted_price?: string | null;
  stock_quantity: string;
  in_stock: boolean;
  product: CartItemProductDto | null;
  /** Bundle satırlarında gelmez. */
  variant?: CartItemVariantDto | null;
  /** Bundle satırlarında `'bundle'`; normal ürünlerde yok ya da `'product'`. */
  item_type?: 'product' | 'bundle' | string | null;
  bundle_product_id?: number | null;
  /** Adet güncelleme ve silme yalnızca bu kimlikle yapılır. */
  bundle_group_id?: string | null;
  bundle?: (BundleDto & { components?: BundleComponentDto[] | null }) | null;
  /** Satıra uygulanan kampanya indirimi; kampanya yoksa gelmez ya da 0 gelir. */
  campaign_discount?: number | string | null;
  /** Kampanya indirimi sonrası satır toplamı (adet dahil). */
  campaign_total?: number | string | null;
}

/** `gift_product` kampanyasının hediye ürünü (kampanya bandında gösterilir). */
export interface CartCampaignGiftProductDto {
  product_id: number;
  name?: string | null;
  image?: string | null;
  quantity?: number | null;
}

export interface CartCampaignDto {
  id: number;
  name: string;
  /** Hediye kampanyalarında `'gift_product'`. */
  type: string;
  campaign_type?: string | null;
  /** Hediye kampanyasının backend'in yazdığı Türkçe şart cümleleri. */
  conditions?: string[] | null;
  /** Hediye kampanyasında verilen ürünler. */
  gift_products?: CartCampaignGiftProductDto[] | null;
  is_applicable: boolean;
  threshold: number | null;
  remaining: number;
  discount?: number;
  end_date?: string | null;
  /** Kampanya bandında gösterilen yönlendirme metni. */
  message?: string | null;
  /** Backend'in hesapladığı ilerleme yüzdesi; yoksa eşikten türetilir. */
  progress_percentage?: number;
  /** Geri sayım anahtarı; yalnızca `1` iken bitiş sayacı gösterilir. */
  counter?: number;
}

/**
 * `/cart/campaigns` yanıtı. Sepet satırlarını değil, yalnızca kampanya durumunu
 * ve eşik tutarlarını taşır; kampanya bandının tek veri kaynağıdır.
 */
export interface CartCampaignsResponseDto {
  subtotal?: number | string | null;
  /** İndirimler sonrası kampanya tabanı; banttaki mevcut tutar budur. */
  campaign_basis?: number | string | null;
  primary_campaign_message?: string | null;
  campaigns?: CartCampaignDto[];
}

export interface AvailableGiftVariantDto {
  variant_id: number;
  name: string | null;
  available_quantity: number;
  /** Bu bedende hediyenin tüm adedi için stok var mı? */
  can_add: boolean;
}

/**
 * Hak edilmiş ama henüz sepete eklenmemiş kampanya hediyesi. Backend yalnız
 * en az bir bedeni eklenebilir olanları döndürür.
 */
export interface AvailableGiftDto {
  product_id: number;
  name: string;
  slug?: string | null;
  image: string | null;
  quantity: number;
  campaign_ids: number[];
  variants: AvailableGiftVariantDto[];
}

export interface CartResponseDto {
  cart: CartItemDto[];
  campaigns?: CartCampaignDto[];
  /** Müşterinin seçip ücretsiz ekleyebileceği hediyeler. */
  available_gifts?: AvailableGiftDto[];
  /** Account-level discount the backend applies before campaigns/coupons. */
  user_discount?: number;
  removed_items?: unknown[];
  message?: string;
}

/** `POST /cart/gifts/add` yanıtı; metin backend'den gelir. */
export interface AddCartGiftResponseDto {
  message?: string;
  already_added?: boolean;
}

