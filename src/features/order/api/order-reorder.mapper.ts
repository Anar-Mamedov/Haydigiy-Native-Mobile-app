import {
  ReorderAvailableItemDto,
  ReorderItemDto,
  ReorderOutOfStockItemDto,
  ReorderResponseDto,
} from './order-reorder.dtos';
import {
  ReorderAvailableItem,
  ReorderItem,
  ReorderOutOfStockItem,
  ReorderResult,
} from '@/types/order.types';

/** Used only when the backend leaves `message` empty. */
export const REORDER_FALLBACK_MESSAGES = {
  added: 'Ürünler sepetinize eklendi.',
  needsConfirmation:
    'Siparişinizdeki bazı ürünler tükenmiştir. Stokta bulunan diğer ürünleri sepetinize eklemek istiyor musunuz?',
  allOutOfStock: 'Siparişinizdeki ürünlerin hiçbiri şu anda stokta bulunmamaktadır.',
  failed: 'Sipariş tekrarlanamadı. Lütfen tekrar deneyin.',
} as const;

const DEFAULT_OUT_OF_STOCK_REASON = 'Stok tükendi';

function toOptionalNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNumber(value: number | string | null | undefined): number {
  return toOptionalNumber(value) ?? 0;
}

function toText(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function mapList<Dto, Model>(
  list: Dto[] | null | undefined,
  mapItem: (dto: Dto, index: number) => Model,
): Model[] {
  return Array.isArray(list) ? list.map(mapItem) : [];
}

function mapReorderItem(dto: ReorderItemDto, index: number): ReorderItem {
  const orderItemId = toOptionalNumber(dto.order_item_id);
  return {
    key: orderItemId !== null ? String(orderItemId) : `index-${index}`,
    orderItemId,
    productId: toOptionalNumber(dto.product_id),
    variantId: toOptionalNumber(dto.variant_id),
    name: toText(dto.name),
    variantName: toText(dto.variant_name),
    slug: toText(dto.slug),
    imageUrl: toText(dto.image) || null,
    requestedQuantity: toNumber(dto.requested_quantity),
    currentStock: toNumber(dto.current_stock),
    price: toNumber(dto.price),
  };
}

function mapOutOfStockItem(dto: ReorderOutOfStockItemDto, index: number): ReorderOutOfStockItem {
  return {
    ...mapReorderItem(dto, index),
    reason: toText(dto.reason) || DEFAULT_OUT_OF_STOCK_REASON,
  };
}

function mapAvailableItem(dto: ReorderAvailableItemDto, index: number): ReorderAvailableItem {
  const item = mapReorderItem(dto, index);
  const addQuantity = toNumber(dto.add_quantity);
  return {
    ...item,
    addQuantity: addQuantity > 0 ? addQuantity : item.requestedQuantity,
    isPartialStock: dto.is_partial_stock === true,
  };
}

/**
 * Maps every `POST /order/{id}/reorder` answer (200 added, 200 needs confirmation,
 * 422 all out of stock) to one discriminated result. Anything unrecognised becomes
 * `failed`, so the screen reports it instead of silently doing nothing.
 */
export function mapReorderResponse(dto: ReorderResponseDto | null | undefined): ReorderResult {
  const body = dto ?? {};
  const message = toText(body.message);
  const outOfStockItems = mapList(body.out_of_stock_items, mapOutOfStockItem);

  if (body.added_to_cart === true) {
    return {
      kind: 'added',
      message: message || REORDER_FALLBACK_MESSAGES.added,
      cartCount: toOptionalNumber(body.cart_count),
      addedItems: mapList(body.added_items, mapAvailableItem),
      outOfStockItems,
      failedCount: Array.isArray(body.failed_items) ? body.failed_items.length : 0,
    };
  }

  if (body.requires_confirmation === true) {
    return {
      kind: 'needsConfirmation',
      message: message || REORDER_FALLBACK_MESSAGES.needsConfirmation,
      outOfStockItems,
      availableItems: mapList(body.available_items, mapAvailableItem),
    };
  }

  if (body.all_out_of_stock === true) {
    return {
      kind: 'allOutOfStock',
      message: message || REORDER_FALLBACK_MESSAGES.allOutOfStock,
      outOfStockItems,
    };
  }

  return { kind: 'failed', message: message || REORDER_FALLBACK_MESSAGES.failed };
}
