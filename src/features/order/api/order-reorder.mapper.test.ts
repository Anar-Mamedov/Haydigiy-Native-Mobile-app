import { mapReorderResponse, REORDER_FALLBACK_MESSAGES } from './order-reorder.mapper';
import { ReorderAvailableItemDto, ReorderOutOfStockItemDto } from './order-reorder.dtos';

const OUT_OF_STOCK: ReorderOutOfStockItemDto = {
  order_item_id: 11,
  product_id: 501,
  variant_id: 9001,
  name: 'Kruvaze Ceket',
  variant_name: 'M',
  slug: 'kruvaze-ceket',
  image: 'https://cdn.test/ceket.webp',
  requested_quantity: 1,
  current_stock: 0,
  price: 899.9,
  reason: 'Stok tükendi',
};

const AVAILABLE: ReorderAvailableItemDto = {
  order_item_id: 12,
  product_id: 502,
  variant_id: 9002,
  name: 'Uzun Kollu Gömlek',
  variant_name: 'L',
  slug: 'uzun-kollu-gomlek',
  image: 'https://cdn.test/gomlek.webp',
  requested_quantity: 3,
  current_stock: 1,
  price: '349.50',
  add_quantity: 1,
  is_partial_stock: true,
};

describe('mapReorderResponse', () => {
  it('maps the "added to cart" answer', () => {
    const result = mapReorderResponse({
      success: true,
      added_to_cart: true,
      requires_confirmation: false,
      message: 'Tüm ürünler başarıyla sepetinize eklendi.',
      cart_count: 4,
      added_items: [AVAILABLE],
      out_of_stock_items: [],
      failed_items: [{ variant_id: 9003, reason: 'Stok yetersiz veya ürün satışta değil' }],
    });

    expect(result).toEqual({
      kind: 'added',
      message: 'Tüm ürünler başarıyla sepetinize eklendi.',
      cartCount: 4,
      addedItems: [
        {
          key: '12',
          orderItemId: 12,
          productId: 502,
          variantId: 9002,
          name: 'Uzun Kollu Gömlek',
          variantName: 'L',
          slug: 'uzun-kollu-gomlek',
          imageUrl: 'https://cdn.test/gomlek.webp',
          requestedQuantity: 3,
          currentStock: 1,
          price: 349.5,
          addQuantity: 1,
          isPartialStock: true,
        },
      ],
      outOfStockItems: [],
      failedCount: 1,
    });
  });

  it('maps the "needs confirmation" answer with both lists', () => {
    const result = mapReorderResponse({
      success: true,
      added_to_cart: false,
      requires_confirmation: true,
      message: 'Bazı ürünler tükendi.',
      out_of_stock_items: [OUT_OF_STOCK],
      available_items: [AVAILABLE],
    });

    expect(result.kind).toBe('needsConfirmation');
    if (result.kind !== 'needsConfirmation') return;
    expect(result.message).toBe('Bazı ürünler tükendi.');
    expect(result.outOfStockItems).toEqual([
      expect.objectContaining({
        key: '11',
        name: 'Kruvaze Ceket',
        variantName: 'M',
        imageUrl: 'https://cdn.test/ceket.webp',
        currentStock: 0,
        reason: 'Stok tükendi',
      }),
    ]);
    expect(result.availableItems).toEqual([
      expect.objectContaining({ key: '12', addQuantity: 1, isPartialStock: true }),
    ]);
  });

  it('maps the 422 "all out of stock" body', () => {
    const result = mapReorderResponse({
      success: false,
      added_to_cart: false,
      requires_confirmation: false,
      all_out_of_stock: true,
      message: 'Siparişinizdeki ürünlerin hiçbiri şu anda stokta bulunmamaktadır.',
      available_items: [],
      out_of_stock_items: [{ ...OUT_OF_STOCK, reason: 'Ürün satışta değil' }],
    });

    expect(result).toEqual({
      kind: 'allOutOfStock',
      message: 'Siparişinizdeki ürünlerin hiçbiri şu anda stokta bulunmamaktadır.',
      outOfStockItems: [expect.objectContaining({ key: '11', reason: 'Ürün satışta değil' })],
    });
  });

  it('falls back to Turkish messages and empty lists when fields are missing', () => {
    expect(mapReorderResponse({ added_to_cart: true })).toEqual({
      kind: 'added',
      message: REORDER_FALLBACK_MESSAGES.added,
      cartCount: null,
      addedItems: [],
      outOfStockItems: [],
      failedCount: 0,
    });
    expect(mapReorderResponse({ requires_confirmation: true, message: '  ' })).toEqual({
      kind: 'needsConfirmation',
      message: REORDER_FALLBACK_MESSAGES.needsConfirmation,
      outOfStockItems: [],
      availableItems: [],
    });
    expect(mapReorderResponse({ all_out_of_stock: true, out_of_stock_items: null })).toEqual({
      kind: 'allOutOfStock',
      message: REORDER_FALLBACK_MESSAGES.allOutOfStock,
      outOfStockItems: [],
    });
  });

  it('defaults every missing item field safely', () => {
    const result = mapReorderResponse({
      requires_confirmation: true,
      out_of_stock_items: [{}],
      available_items: [{ requested_quantity: '2', image: '' }, { order_item_id: 7 }],
    });

    if (result.kind !== 'needsConfirmation') throw new Error(`unexpected kind ${result.kind}`);
    expect(result.outOfStockItems[0]).toEqual({
      key: 'index-0',
      orderItemId: null,
      productId: null,
      variantId: null,
      name: '',
      variantName: '',
      slug: '',
      imageUrl: null,
      requestedQuantity: 0,
      currentStock: 0,
      price: 0,
      reason: 'Stok tükendi',
    });
    // add_quantity yoksa sipariş adedi eklenecek adet sayılır.
    expect(result.availableItems[0]).toEqual(
      expect.objectContaining({
        key: 'index-0',
        imageUrl: null,
        requestedQuantity: 2,
        addQuantity: 2,
        isPartialStock: false,
      }),
    );
    expect(result.availableItems[1].key).toBe('7');
  });

  it('reports an unrecognised or empty body as a failure instead of succeeding silently', () => {
    expect(mapReorderResponse(null)).toEqual({
      kind: 'failed',
      message: REORDER_FALLBACK_MESSAGES.failed,
    });
    expect(mapReorderResponse({ success: false, message: 'Sipariş bulunamadı.' })).toEqual({
      kind: 'failed',
      message: 'Sipariş bulunamadı.',
    });
  });
});
