import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

/** A payment option from `GET /payment-types` (credit_card, kapida_odeme, …). */
export interface PaymentTypeDto {
  id: number;
  name: string;
  slug: string;
  commission_rate: number;
  service_fee: number;
  sort_order: number;
  description?: string | null;
  max_order_total?: number | string | null;
}

interface PaymentTypesResponseDto {
  status?: boolean;
  data?: PaymentTypeDto[];
}

/** Available payment methods for the checkout payment-options list. */
export async function getPaymentTypesDto(): Promise<PaymentTypeDto[]> {
  if (!appEnv.apiBaseUrl) return [];
  const response = await apiClient.get<PaymentTypesResponseDto>('/payment-types');
  return Array.isArray(response.data?.data) ? response.data.data : [];
}
