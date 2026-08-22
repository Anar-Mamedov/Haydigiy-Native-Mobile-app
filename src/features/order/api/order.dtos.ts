import { BundleComponentDto } from '@/features/bundle/api/bundle.dtos';

export interface OrderProductDto {
  name?: string;
  variant_name?: string;
  image?: string | null;
  slug?: string;
  product_id?: number;
  variant_id?: number;
  /** Bundle satırları listede TEK ürün olarak döner (`item_type: 'bundle'`). */
  item_type?: 'product' | 'bundle' | string | null;
  bundle_product_id?: number | null;
  bundle_group_id?: string | null;
  /** Paket içeriği; bu uçta ad/slug `product_name`/`product_slug` olarak gelir. */
  components?: BundleComponentDto[] | null;
}

export interface OrderLineItemDto {
  name?: string;
  variant_name?: string;
  quantity?: number;
  image?: string | null;
  slug?: string;
}

type DtoList<T> = T[] | Record<string, T> | null | undefined;

export interface OrderDto {
  id: number;
  order_no?: string;
  order_number?: string;
  status: string;
  status_color?: string;
  total_price: string;
  created_at: string;
  shipment_count?: number;
  product_count?: number;
  receiver?: string;
  products?: DtoList<OrderProductDto>;
  cancelled_items?: DtoList<OrderLineItemDto>;
  returned_items?: DtoList<OrderLineItemDto>;
}

export interface OrderMetaDto {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface OrdersResponseDto {
  data?: OrderDto[];
  meta?: OrderMetaDto;
}

export interface ReturnRequestItemDto {
  quantity?: number;
  reason?: { name?: string } | null;
  status_name?: string | null;
  /** User-uploaded return photos, when present. */
  thumbnail_path?: string | null;
  photo_path?: string | null;
}

export interface ReturnRequestDto {
  id: number;
  return_code?: string;
  status?: number | string;
  status_name?: string | null;
  created_at?: string;
  order_id?: number;
  order?: {
    id?: number;
    order_no?: string;
    total_price?: string;
    created_at?: string;
    shipping_address_snapshot?: { name?: string; surname?: string } | null;
  } | null;
  items?: ReturnRequestItemDto[];
}

export interface ReturnRequestsResponseDto {
  data?: ReturnRequestDto[];
  meta?: OrderMetaDto;
}
