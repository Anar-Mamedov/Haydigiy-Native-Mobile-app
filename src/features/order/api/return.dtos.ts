export interface ReturnReasonDto {
  id: number;
  name: string;
}

export interface ReturnReasonsResponseDto {
  data?: ReturnReasonDto[];
}

/** A single refund method from `GET /return-requests/refund-methods`. */
export interface RefundMethodDto {
  id: number;
  name?: string | null;
  code: string;
}

export interface RefundMethodsResponseDto {
  data?: RefundMethodDto[];
}

export interface ReturnItemPayloadDto {
  order_item_id: number;
  quantity: number;
  return_reason_id: number;
}

/** `POST /return-requests` success payload (mirrors the web return flow). */
export interface ReturnSubmitResponseDto {
  return_code?: string;
  code?: string;
  expires_at?: string;
  message?: string;
}
