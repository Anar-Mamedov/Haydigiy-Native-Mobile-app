import {
  CancelledItemDetailDto,
  OrderAddressDto,
  OrderDetailItemDto,
  OrderDetailResponseDto,
  ReturnedItemDetailDto,
} from './order-detail.dtos';
import { OrderAddress, OrderDetail, OrderDetailItem } from '@/types/order.types';
import { formatOrderDate } from '../utils/order-status';

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function toArray<T>(value: T[] | Record<string, T> | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function mapAddress(dto: OrderAddressDto | null | undefined): OrderAddress | null {
  if (!dto) return null;
  return {
    name: dto.name ?? '',
    surname: dto.surname ?? '',
    phone: dto.phone ?? '',
    addressLine: dto.address_line ?? '',
    neighbourhood: dto.neighbourhood ?? '',
    district: dto.district ?? '',
    city: dto.city ?? '',
    zipCode: dto.zip_code ?? null,
  };
}

function mapItem(dto: OrderDetailItemDto): OrderDetailItem {
  return {
    id: dto.id,
    name: dto.name ?? '',
    variantName: dto.variant_name ?? '',
    slug: dto.slug ?? '',
    image: dto.image ?? null,
    quantity: toNumber(dto.quantity),
    price: toNumber(dto.price),
    kind: 'normal',
  };
}

function mapReturnedItem(dto: ReturnedItemDetailDto): OrderDetailItem {
  return {
    id: dto.order_item_id ?? 0,
    name: dto.name ?? '',
    variantName: dto.variant_name ?? '',
    slug: dto.slug ?? '',
    image: dto.image ?? null,
    quantity: toNumber(dto.quantity),
    price: toNumber(dto.price),
    kind: 'returned',
    note: dto.status_name?.trim() || dto.return_reason?.trim() || undefined,
  };
}

function mapCancelledItem(dto: CancelledItemDetailDto): OrderDetailItem {
  return {
    id: dto.order_item_id ?? 0,
    name: dto.name ?? '',
    variantName: dto.variant_name ?? '',
    slug: dto.slug ?? '',
    image: dto.image ?? null,
    quantity: toNumber(dto.quantity),
    price: toNumber(dto.price),
    kind: 'cancelled',
    note: dto.cancellation_reason?.trim() || undefined,
  };
}

export function mapOrderDetail(dto: OrderDetailResponseDto): OrderDetail {
  const items = toArray(dto.items).map(mapItem);
  const returnedItems = (dto.returned_items ?? []).map(mapReturnedItem);
  const cancelledItems = (dto.cancelled_items ?? []).map(mapCancelledItem);
  const totals = dto.totals ?? {};

  const totalItemsQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const returnedQty = returnedItems.reduce((sum, item) => sum + item.quantity, 0);
  const cancelledQty = cancelledItems.reduce((sum, item) => sum + item.quantity, 0);
  const statusId = toNumber(dto.status_id);

  return {
    id: dto.id,
    orderNo: dto.order_no ?? '-',
    createdAt: formatOrderDate(dto.created_at ?? ''),
    deliveredAt: formatOrderDate(dto.delivered_at ?? ''),
    status: dto.status ?? '',
    statusColor: dto.status_color,
    statusId,
    trackingCode: dto.tracking_code ?? null,
    cargoCompanyName: dto.cargo_company_name ?? null,
    invoicePdfUrl: dto.invoice_pdf_url ?? null,
    shippingAddress: mapAddress(dto.shipping_address),
    billingAddress: mapAddress(dto.billing_address),
    billingType: dto.billing_type ?? 'individual',
    tcNumber: dto.tc_number ?? null,
    taxNumber: dto.tax_number ?? null,
    taxOffice: dto.tax_office ?? null,
    items,
    returnedItems,
    cancelledItems,
    totals: {
      subtotal: toNumber(totals.subtotal),
      userDiscount: toNumber(totals.user_discount_amount),
      couponDiscount: toNumber(totals.coupon_discount_amount),
      couponCode: dto.coupon_code ?? null,
      campaignDiscount: toNumber(totals.campaign_discount_amount),
      cargoFee: toNumber(totals.cargo_service_price),
      codFee: toNumber(totals.cod_service_fee),
      paymentFee: toNumber(totals.payment_fee),
      returnTotal: toNumber(dto.return_totals?.return_total),
      total: toNumber(totals.total_price),
      paymentMethod: dto.payment_method?.trim() ?? '',
    },
    totalItemsQty,
    returnedQty,
    cancelledQty,
    isFullyCancelled:
      statusId === 4 || (cancelledQty > 0 && totalItemsQty === 0 && returnedQty === 0),
  };
}
