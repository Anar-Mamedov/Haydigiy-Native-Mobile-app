import { isBundleLine, mapBundleComponents } from '@/features/product/api/bundle.mapper';
import {
  OrderDto,
  OrderLineItemDto,
  OrderMetaDto,
  OrderProductDto,
  OrdersResponseDto,
  ReturnRequestDto,
  ReturnRequestsResponseDto,
} from './order.dtos';
import { Order, OrderMeta, OrderProduct, OrdersPage } from '@/types/order.types';
import { BRAND_COLOR } from '@/lib/theme/colors';

/** Backend lists arrive either as arrays or keyed objects; normalize to arrays. */
function toArray<T>(value: T[] | Record<string, T> | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function toNumber(value: number | string | undefined, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function mapProduct(dto: OrderProductDto): OrderProduct {
  const isBundle = isBundleLine(dto);

  return {
    name: dto.name ?? '',
    variantName: dto.variant_name ?? '',
    image: dto.image ?? null,
    slug: dto.slug ?? '',
    kind: 'normal',
    ...(isBundle
      ? {
          isBundle: true,
          bundleGroupId: dto.bundle_group_id ?? undefined,
          bundleComponents: mapBundleComponents(dto.components),
        }
      : {}),
  };
}

function mapLineItem(dto: OrderLineItemDto, kind: 'returned' | 'cancelled'): OrderProduct {
  return {
    name: dto.name ?? '',
    variantName: dto.variant_name ?? '',
    image: dto.image ?? null,
    slug: dto.slug ?? '',
    kind,
  };
}

export function mapOrderDto(dto: OrderDto): Order {
  const products = toArray(dto.products).map(mapProduct);
  const cancelled = toArray(dto.cancelled_items);
  const returned = toArray(dto.returned_items);

  const cancelledQty = cancelled.reduce((sum, item) => sum + toNumber(item.quantity), 0);
  const returnedQty = returned.reduce((sum, item) => sum + toNumber(item.quantity), 0);
  const productCount = toNumber(dto.product_count);

  return {
    id: dto.id,
    orderNo: dto.order_no || dto.order_number || '-',
    status: dto.status,
    statusColor: dto.status_color,
    totalPrice: dto.total_price,
    createdAt: dto.created_at ?? '',
    shipmentCount: toNumber(dto.shipment_count),
    productCount,
    receiver: dto.receiver ?? '',
    products: [
      ...products,
      ...returned.map((item) => mapLineItem(item, 'returned')),
      ...cancelled.map((item) => mapLineItem(item, 'cancelled')),
    ],
    isFullyCancelled: cancelledQty > 0 && productCount === 0 && returnedQty === 0,
  };
}

/**
 * Maps a return request into an Order-shaped card. Intentionally does NOT fetch
 * each order's detail (the web client's per-order `GET /order/{id}` is an N+1
 * anti-pattern in a list). Each returned line becomes a thumbnail using the
 * return photo when available; the card renders a placeholder when it is null.
 */
export function mapReturnRequestDto(dto: ReturnRequestDto): Order {
  const order = dto.order ?? {};
  const items = dto.items ?? [];
  const snapshot = order.shipping_address_snapshot;
  const totalQty = items.reduce((sum, item) => sum + toNumber(item.quantity), 0);
  const reasons = Array.from(
    new Set(items.map((item) => item.reason?.name).filter((name): name is string => Boolean(name))),
  );

  return {
    id: order.id ?? dto.order_id ?? dto.id,
    orderNo: order.order_no || '-',
    status: 'İade Talebi Oluşturuldu',
    statusColor: BRAND_COLOR,
    totalPrice: order.total_price || '0.00',
    createdAt: order.created_at || dto.created_at || '',
    shipmentCount: 1,
    productCount: totalQty || items.length,
    receiver: snapshot ? `${snapshot.name ?? ''} ${snapshot.surname ?? ''}`.trim() : '',
    products: items.map(
      (item): OrderProduct => ({
        name: '',
        variantName: '',
        image: item.thumbnail_path ?? item.photo_path ?? null,
        slug: '',
        kind: 'returned',
      }),
    ),
    isFullyCancelled: false,
    // Return request id is unique even when several returns share one order.
    returnRequestId: dto.id,
    returnReasons: reasons,
  };
}

function mapMeta(meta: OrderMetaDto | undefined, fallbackCount: number): OrderMeta {
  return {
    currentPage: toNumber(meta?.current_page, 1),
    lastPage: toNumber(meta?.last_page, 1),
    perPage: toNumber(meta?.per_page, fallbackCount),
    total: toNumber(meta?.total, fallbackCount),
  };
}

export function mapOrdersResponse(response: OrdersResponseDto): OrdersPage {
  const orders = (response.data ?? []).map(mapOrderDto);
  return { orders, meta: mapMeta(response.meta, orders.length) };
}

export function mapReturnRequestsResponse(response: ReturnRequestsResponseDto): OrdersPage {
  const orders = (response.data ?? []).map(mapReturnRequestDto);
  return { orders, meta: mapMeta(response.meta, orders.length) };
}
