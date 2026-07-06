import {
  CancelledItemDetailDto,
  OrderAddressDto,
  OrderDetailItemDto,
  OrderDetailResponseDto,
  OrderTotalsDto,
  ReturnedItemDetailDto,
} from './order-detail.dtos';
import { OrderAddress, OrderDetail, OrderDetailItem } from '@/types/order.types';
import { formatOrderDate, formatOrderTimelineDate, formatReturnDeadline } from '../utils/order-status';
import { isPendingReturn, normalizeReturnStatus } from '../utils/return-status';

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
    email: dto.email ?? null,
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
    productId: dto.product_id,
    variantId: dto.variant_id,
    name: dto.name ?? '',
    variantName: dto.variant_name ?? '',
    slug: dto.slug ?? '',
    image: dto.image ?? null,
    quantity: toNumber(dto.quantity),
    price: toNumber(dto.price),
    kind: 'normal',
    isReviewed:
      Boolean(dto.product_review) || Boolean(dto.reviewed) || toNumber(dto.reviews_count) > 0,
    isNonReturnable: dto.is_non_returnable === true,
    returnStatus: dto.return_status ?? undefined,
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
    returnRequestId: dto.return_request_id ?? null,
    returnCode: dto.return_code ?? null,
    returnRequestedAt: dto.requested_at ?? null,
    returnReceivedAt: dto.received_at ?? null,
    returnStatusCode: normalizeReturnStatus(dto.status),
    returnStatusName: dto.status_name ?? null,
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
    cancelledAt: dto.cancelled_at ?? null,
  };
}

/** Picks the first installment count > 1 from the candidate fields, else null. */
function resolveInstallmentCount(dto: OrderDetailResponseDto, totals: OrderTotalsDto): number | null {
  const candidates = [dto.installment_count, dto.payment_installment_count, totals.installment_count];
  for (const candidate of candidates) {
    const value = toNumber(candidate as number | string | null | undefined);
    if (Number.isInteger(value) && value > 1) return value;
  }
  return null;
}

export function mapOrderDetail(dto: OrderDetailResponseDto): OrderDetail {
  const items = toArray(dto.items).map(mapItem);
  const returnedItems = (dto.returned_items ?? []).map(mapReturnedItem);
  const cancelledItems = (dto.cancelled_items ?? []).map(mapCancelledItem);
  const totals = dto.totals ?? {};

  // Web paritesi: beklemede olan ve henüz depoya ulaşmamış ilk iade talebi iptal edilebilir.
  const cancellableReturnRequestId =
    (dto.returned_items ?? []).find(
      (item) => isPendingReturn(item.status) && !item.received_at,
    )?.return_request_id ?? null;
  const hasHepsijetReturn = (dto.returned_items ?? []).some((item) => item.is_hepsijet === true);

  const totalItemsQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const returnedQty = returnedItems.reduce((sum, item) => sum + item.quantity, 0);
  const cancelledQty = cancelledItems.reduce((sum, item) => sum + item.quantity, 0);
  const statusId = toNumber(dto.status_id);

  const totalPrice = toNumber(totals.total_price);
  const interestAmount = toNumber(totals.interest_amount);
  const totalWithInterest = toNumber(totals.total_with_interest);
  const installmentCount = resolveInstallmentCount(dto, totals);
  const hasTotalWithInterest = totalWithInterest > 0 && totalWithInterest !== totalPrice;
  const hasInstallmentInfo =
    interestAmount > 0 || hasTotalWithInterest || installmentCount !== null;
  const payableTotal = hasInstallmentInfo && hasTotalWithInterest ? totalWithInterest : totalPrice;
  const shippedAt = formatOrderTimelineDate(dto.shipped_at);

  return {
    id: dto.id,
    orderNo: dto.order_no ?? '-',
    createdAt: formatOrderDate(dto.created_at ?? ''),
    deliveredAt: formatOrderDate(dto.delivered_at ?? ''),
    timelineDates: {
      orderedAt: formatOrderTimelineDate(dto.created_at),
      confirmedAt: formatOrderTimelineDate(dto.confirmed_at),
      preparedAt: shippedAt,
      shippedAt,
      deliveredAt: formatOrderTimelineDate(dto.delivered_at),
    },
    status: dto.status ?? '',
    statusColor: dto.status_color,
    statusId,
    trackingCode: dto.tracking_code ?? null,
    cargoCompanyName: dto.cargo_company_name ?? null,
    cargoCompanyLogo: dto.cargo_company_logo ?? null,
    invoicePdfUrl: dto.invoice_pdf_url ?? null,
    paymentMethodId: typeof dto.payment_method_id === 'number' ? dto.payment_method_id : null,
    canCreateReturnRequest: dto.can_create_return_request ?? true,
    returnBlockReason: dto.return_block_reason ?? null,
    returnDeadline: formatReturnDeadline(dto.delivered_at ?? ''),
    returnRequestIds: (dto.return_requests ?? []).map((request) => request.id),
    cancellableReturnRequestId,
    hasHepsijetReturn,
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
      total: totalPrice,
      paymentMethod: dto.payment_method?.trim() ?? '',
      installmentCount,
      interestAmount,
      totalWithInterest,
      hasInstallmentInfo,
      payableTotal,
    },
    totalItemsQty,
    returnedQty,
    cancelledQty,
    isFullyCancelled:
      statusId === 4 || (cancelledQty > 0 && totalItemsQty === 0 && returnedQty === 0),
  };
}
