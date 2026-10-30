type NumericDto = number | string | null;

export interface OrderMergeUiDto {
  title?: string | null;
  description?: string | null;
  diff_amount_text?: string | null;
  installment_text?: string | null;
  button_text?: string | null;
  secondary_button_text?: string | null;
}

export interface OrderMergeOrderDto {
  id?: NumericDto;
  order_no?: string | null;
  is_cod?: boolean | null;
  is_card?: boolean | null;
  is_installment?: boolean | null;
  installment_count?: NumericDto;
}

/** `GET /order/merge-eligible`. `eligible: false` comes with a `reason` only. */
export interface OrderMergeEligibilityDto {
  eligible?: boolean;
  reason?: string;
  ui?: OrderMergeUiDto | null;
  order?: OrderMergeOrderDto | null;
  cart_summary?: { diff_amount?: NumericDto } | null;
}

/** `POST /order/merge-cod`. */
export interface OrderMergeCodResponseDto {
  success?: boolean;
  message?: string | null;
  order_no?: string | null;
  total_price?: NumericDto;
  diff_amount?: NumericDto;
}

/**
 * `POST /order/merge-card-prepare`. The backend answers with `total_price` /
 * `diff_amount`; `diff_total` is the name in the integration note and is accepted too.
 */
export interface OrderMergeCardPrepareResponseDto {
  success?: boolean;
  message?: string | null;
  order_token?: string | null;
  order_no?: string | null;
  parent_order_no?: string | null;
  parent_order_id?: NumericDto;
  diff_total?: NumericDto;
  diff_amount?: NumericDto;
  total_price?: NumericDto;
  cargo_id?: NumericDto;
  payment_method_id?: NumericDto;
  installment_count?: NumericDto;
  is_installment?: boolean | null;
}
