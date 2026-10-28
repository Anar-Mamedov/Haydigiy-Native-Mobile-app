/** A single order line as reported by `POST /order/{id}/reorder`. */
export interface ReorderItemDto {
  order_item_id?: number | null;
  product_id?: number | null;
  variant_id?: number | null;
  name?: string | null;
  variant_name?: string | null;
  slug?: string | null;
  image?: string | null;
  requested_quantity?: number | string | null;
  current_stock?: number | string | null;
  price?: number | string | null;
}

/** Line that cannot be added (sold out or no longer on sale). */
export interface ReorderOutOfStockItemDto extends ReorderItemDto {
  /** `Stok tükendi` | `Ürün satışta değil`. */
  reason?: string | null;
}

/** Line that can be added; `add_quantity` is capped by the current stock. */
export interface ReorderAvailableItemDto extends ReorderItemDto {
  add_quantity?: number | string | null;
  is_partial_stock?: boolean | null;
}

/**
 * Every reorder response shape in one DTO:
 * - 200 `added_to_cart: true` → the available lines were added to the cart.
 * - 200 `requires_confirmation: true` → nothing added yet; some lines sold out.
 * - 422 `all_out_of_stock: true` → nothing can be added.
 */
export interface ReorderResponseDto {
  success?: boolean;
  added_to_cart?: boolean;
  requires_confirmation?: boolean;
  all_out_of_stock?: boolean;
  message?: string | null;
  cart_count?: number | string | null;
  added_items?: ReorderAvailableItemDto[] | null;
  available_items?: ReorderAvailableItemDto[] | null;
  out_of_stock_items?: ReorderOutOfStockItemDto[] | null;
  failed_items?: unknown[] | null;
}
