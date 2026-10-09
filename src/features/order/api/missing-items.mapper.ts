import {
  MissingDeliveryItemDto,
  MissingItemCaseDto,
  MissingItemLineDto,
  MissingItemsDto,
  OrderDetailItemDto,
} from './order-detail.dtos';
import {
  MissingCase,
  MissingCaseDelivery,
  MissingCaseKind,
  MissingCaseLine,
} from '@/types/order.types';
import { resolveCdnUrl } from '@/utils/cdn';

const RESOLVED_STATUS = 'resolved';

function toNumber(value: number | string | null | undefined): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
}

function mapLine(dto: MissingItemLineDto, slugByOrderItemId: Map<number, string>): MissingCaseLine {
  return {
    id: dto.id,
    name: dto.name?.trim() ?? '',
    image: resolveCdnUrl(dto.image),
    variantName: dto.variant_name?.trim() ?? '',
    missingQuantity: toNumber(dto.missing_quantity),
    slug: dto.order_item_id != null ? (slugByOrderItemId.get(dto.order_item_id) ?? '') : '',
  };
}

function mapDelivery(dto: MissingDeliveryItemDto): MissingCaseDelivery {
  return {
    orderId: dto.id,
    orderNo: dto.order_no?.trim() ?? '',
    status: dto.status?.trim() ?? '',
    cargoCompanyName: dto.cargo_company_name?.trim() || null,
    trackingCode: dto.tracking_code?.trim() || null,
    itemCount: (dto.items ?? []).length,
  };
}

function mapCase(
  dto: MissingItemCaseDto,
  kind: MissingCaseKind,
  deliveries: MissingDeliveryItemDto[],
  slugByOrderItemId: Map<number, string>,
): MissingCase {
  const caseNo = dto.case_no?.trim() ?? '';
  const isResolved = dto.status === RESOLVED_STATUS;
  // Telafi gönderisi, bildirim numarasıyla aynı sipariş numarasını taşır.
  const delivery = caseNo ? deliveries.find((item) => item.order_no?.trim() === caseNo) : undefined;

  return {
    id: dto.id,
    caseNo,
    kind,
    isResolved,
    statusLabel: dto.status_label?.trim() || (isResolved ? 'Çözüldü' : 'Bildirildi'),
    resolutionNote: dto.resolution_note?.trim() || null,
    lines: (dto.items ?? []).map((line) => mapLine(line, slugByOrderItemId)),
    delivery: delivery ? mapDelivery(delivery) : null,
  };
}

/**
 * Maps `missing_items` into report cards: missing products first, then missing parts.
 * Order lines are only used to resolve product slugs so each line can open its product.
 */
export function mapMissingCases(
  dto: MissingItemsDto | null | undefined,
  orderItems: OrderDetailItemDto[],
): MissingCase[] {
  if (!dto) return [];

  const deliveries = dto.delivery_items ?? [];
  const slugByOrderItemId = new Map<number, string>();
  for (const item of orderItems) {
    if (item.slug) slugByOrderItemId.set(item.id, item.slug);
  }

  return [
    ...(dto.products ?? []).map((item) => mapCase(item, 'product', deliveries, slugByOrderItemId)),
    ...(dto.parts ?? []).map((item) => mapCase(item, 'part', deliveries, slugByOrderItemId)),
  ];
}
