import {
  CancellationReasonDto,
  CancelItemPayloadDto,
  CancelPreviewDto,
} from './order-cancel.dtos';
import { CancellationReason, CancelItem, CancelPreview } from '@/types/order.types';

function num(value: number | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function mapCancelPreview(dto: CancelPreviewDto): CancelPreview {
  const currentCargoFee = num(dto.current_cargo_fee);
  const newCargoFee = num(dto.new_cargo_fee);
  return {
    campaignWillBreak: Boolean(dto.campaign_will_break),
    currentTotal: num(dto.current_total),
    newTotal: num(dto.new_total),
    cancelledAmount: num(dto.cancelled_amount),
    currentCargoFee,
    newCargoFee,
    netRefundAmount: num(dto.net_refund_amount),
    brokenCampaigns: (dto.broken_campaigns ?? []).map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      minOrderAmount: num(campaign.min_order_amount),
    })),
    wasFreeShipping: Boolean(dto.was_free_shipping),
    addedCargoFee: num(dto.added_cargo_fee, Math.max(0, newCargoFee - currentCargoFee)),
    cancellationBlocked: Boolean(dto.cancellation_blocked),
    blockMessage: dto.block_message ?? null,
  };
}

export function mapCancellationReason(dto: CancellationReasonDto): CancellationReason {
  return { id: dto.id, name: dto.name };
}

export function toCancelItemPayload(item: CancelItem): CancelItemPayloadDto {
  return {
    order_item_id: item.orderItemId,
    quantity: item.quantity,
    cancellation_reason_id: item.cancellationReasonId,
  };
}
