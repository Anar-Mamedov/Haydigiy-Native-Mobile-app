export interface CartItemProductDto {
  id?: number;
  name: string;
  slug: string;
  seller_name?: string;
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
  variant: CartItemVariantDto;
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
  removed_items?: unknown[];
  message?: string;
}

