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
  /** Bundle satırlarında gelmez; paket satırı `bundle_group_id` ile tanınır. */
  variant_id: number;
  quantity: number;
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
}

export interface CartCampaignDto {
  id: number;
  name: string;
  type: string;
  is_applicable: boolean;
  threshold: number | null;
  remaining: number;
  discount?: number;
  end_date?: string | null;
}

export interface CartResponseDto {
  cart: CartItemDto[];
  campaigns?: CartCampaignDto[];
  /** Account-level discount the backend applies before campaigns/coupons. */
  user_discount?: number;
  removed_items?: unknown[];
  message?: string;
}

