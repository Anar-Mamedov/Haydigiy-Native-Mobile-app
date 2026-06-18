export interface CancelItemPayloadDto {
  order_item_id: number;
  quantity: number;
  cancellation_reason_id?: number;
}

export interface BrokenCampaignDto {
  id: number;
  name: string;
  type: string;
  min_order_amount: number;
}

export interface CancelPreviewDto {
  campaign_will_break?: boolean;
  current_total?: number;
  new_total?: number;
  cancelled_amount?: number;
  current_cargo_fee?: number;
  new_cargo_fee?: number;
  net_refund_amount?: number;
  broken_campaigns?: BrokenCampaignDto[];
  was_free_shipping?: boolean;
  added_cargo_fee?: number;
  cancellation_blocked?: boolean;
  block_message?: string | null;
}

export interface CancellationReasonDto {
  id: number;
  name: string;
}

export interface CancellationReasonsResponseDto {
  data?: CancellationReasonDto[];
}

export interface CancelSubmitResponseDto {
  message?: string;
}

/** 409 (acknowledgement required) / 422 (blocked) error payloads carry a preview. */
export interface CancelErrorPayloadDto extends CancelPreviewDto {
  message?: string;
  requires_acknowledgement?: boolean;
  preview?: CancelPreviewDto;
}
