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
  /** When true the line cannot be returned (e.g. hygiene products). */
  is_non_returnable?: boolean;
  /** `available` | `gift_product` | other backend label. */
  return_status?: string | null;
  /**
   * Bundle bileşeni olan satırlarda dolu gelir. Aynı `bundle_group_id`'ye sahip
   * satırlar TEK bir paketi oluşturur: iptal ve iade ekranlarında ayrı seçilemezler.
   */
  bundle_product_id?: number | null;
  bundle_item_id?: number | null;
  bundle_group_id?: string | null;
}

/**
 * Müşteri görünümü satırı: bundle burada TEK satır olarak gelir ve paketin adı,
 * görseli, tutarı buradan okunur. İade/iptal daima `items` üzerinden yapılır.
 */
export interface OrderDetailDisplayItemDto extends OrderDetailItemDto {
  item_type?: 'product' | 'bundle' | string | null;
  total?: number | string;
}

export interface ReturnRequestRefDto {
  id: number;
}

/**
 * How the refund was settled, sent once the return is completed. For gift-voucher
 * refunds the backend creates a customer-specific coupon after WMS approval.
 */
export interface ReturnPaymentInfoDto {
  type?: string | null;
  message?: string | null;
  iban?: string | null;
  iban_name?: string | null;
  amount?: number | string | null;
  coupon_code?: string | null;
  expires_at?: string | null;
  refund_method?: { id?: number | null; name?: string | null; code?: string | null } | null;
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
  return_request_id?: number;
  return_code?: string | null;
  requested_at?: string | null;
  deliveryDateCurrent?: string | null;
  received_at?: string | null;
  /** Depo kontrolü sonrası onay tarihi (backend biçimli metin). */
  approved_at?: string | null;
  /** İade edilecek/edilen tutar; onaydan önce "0.00" gelebilir. */
  refund_amount?: number | string | null;
  status?: number | string | null;
  is_hepsijet?: boolean;
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
  cancelled_at?: string | null;
}

/** A missing product/part report ("eksik ürün/parça bildirimi") raised on the order. */
export interface MissingItemCaseDto {
  id: number;
  case_no?: string | null;
  /** `resolved` once closed; any other value means the report is still open. */
  status?: string | null;
  status_label?: string | null;
  stored_status?: string | null;
  reported_at?: string | null;
  resolved_at?: string | null;
  resolution_note?: string | null;
  tracking_code?: string | null;
  items?: MissingItemLineDto[] | null;
}

export interface MissingItemLineDto {
  id: number;
  order_item_id?: number | null;
  name?: string | null;
  /** The report's own image URL; not derived from the order line. */
  image?: string | null;
  variant_name?: string | null;
  missing_quantity?: number | string | null;
  compensation_amount?: number | string | null;
  resolution_type?: string | null;
}

/** Compensation shipment created for a report; `order_no` equals the report's `case_no`. */
export interface MissingDeliveryItemDto {
  /** Order id of the compensation shipment, used for `/order/{id}/cargo-tracking`. */
  id: number;
  order_no?: string | null;
  status_id?: number | null;
  status?: string | null;
  cargo_company_name?: string | null;
  tracking_code?: string | null;
  tracking_url?: string | null;
  created_at?: string | null;
  items?: { id: number; name?: string | null; quantity?: number | string | null }[] | null;
}

export interface MissingItemsDto {
  products?: MissingItemCaseDto[] | null;
  parts?: MissingItemCaseDto[] | null;
  delivery_items?: MissingDeliveryItemDto[] | null;
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
  installment_count?: number | string | null;
  interest_amount?: number | string | null;
  total_with_interest?: number | string | null;
}

export interface OrderDetailResponseDto {
  id: number;
  order_no?: string;
  created_at?: string;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  status?: string;
  status_color?: string;
  status_id?: number;
  delivered_at?: string;
  tracking_code?: string | null;
  cargo_company_name?: string | null;
  cargo_company_logo?: string | null;
  invoice_pdf_url?: string | null;
  payment_method?: string;
  payment_method_id?: number;
  installment_count?: number | string | null;
  payment_installment_count?: number | string | null;
  can_create_return_request?: boolean;
  return_block_reason?: string | null;
  return_requests?: ReturnRequestRefDto[] | null;
  return_payment_info?: ReturnPaymentInfoDto | null;
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
  display_items?: OrderDetailDisplayItemDto[] | null;
  returned_items?: ReturnedItemDetailDto[] | null;
  cancelled_items?: CancelledItemDetailDto[] | null;
  missing_items?: MissingItemsDto | null;
}
