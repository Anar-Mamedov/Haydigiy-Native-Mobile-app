export interface OrderCargoMovementDto {
  id?: number | string;
  movement_code?: string | null;
  movement_description?: string | null;
  movement_location?: string | null;
  movement_date?: string | null;
  movement_datetime?: string | null;
  cargo_company_id?: number | string | null;
  raw_response?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface OrderCargoTrackingDataDto {
  order?: {
    order_no?: string | null;
    tracking_code?: string | null;
    status?: { name?: string | null } | string | null;
    cargo_company?: string | null;
  } | null;
  cargo_status?: string | Record<string, unknown> | null;
  cargo_movements?: OrderCargoMovementDto[] | Record<string, OrderCargoMovementDto> | null;
  raw_response?: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface OrderCargoTrackingResponseDto {
  success?: boolean;
  message?: string;
  data?: OrderCargoTrackingDataDto | null;
}
