export interface OrderAddressDto {
  name?: string;
  surname?: string;
  phone?: string;
  email?: string | null;
  address_line?: string;
  neighbourhood?: string;
  district?: string;
  city?: string;
  zip_code?: string | null;
}

export interface OrderDetailItemDto {
  id: number;
  product_id?: number;
  variant_id?: number;
  name?: string;
  variant_name?: string;
  slug?: string;
  image?: string | null;
  quantity?: number;
  price?: number | string;
  reviewed?: boolean;
  product_review?: boolean;
  reviews_count?: number;
}

export interface ReturnedItemDetailDto {
  order_item_id?: number;
  name?: string;
  variant_name?: string;
  slug?: string;
  image?: string | null;
  quantity?: number;
  price?: number | string;
  status_name?: string | null;
  return_reason?: string | null;
}

export interface CancelledItemDetailDto {
  order_item_id?: number;
  name?: string;
  variant_name?: string;
  slug?: string;
  image?: string | null;
  quantity?: number;
  price?: number | string;
  cancellation_reason?: string | null;
}

export interface OrderTotalsDto {
  subtotal?: number | string;
  tax_total?: number | string;
  user_discount_amount?: number | string;
  coupon_discount_amount?: number | string;
  campaign_discount_amount?: number | string | null;
  cargo_service_price?: number | string;
  cod_service_fee?: number | string;
  payment_fee?: number | string;
  total_price?: number | string;
}

export interface OrderDetailResponseDto {
  id: number;
  order_no?: string;
  created_at?: string;
  status?: string;
  status_color?: string;
  status_id?: number;
  delivered_at?: string;
  tracking_code?: string | null;
  cargo_company_name?: string | null;
  invoice_pdf_url?: string | null;
  payment_method?: string;
  coupon_code?: string | null;
  billing_type?: string;
  tc_number?: string | null;
  tax_number?: string | null;
  tax_office?: string | null;
  shipping_address?: OrderAddressDto | null;
  billing_address?: OrderAddressDto | null;
  totals?: OrderTotalsDto;
  return_totals?: { return_total?: number | string | null } | null;
  items?: OrderDetailItemDto[] | Record<string, OrderDetailItemDto> | null;
  returned_items?: ReturnedItemDetailDto[] | null;
  cancelled_items?: CancelledItemDetailDto[] | null;
}
