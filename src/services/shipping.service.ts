import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { ShippingEstimateDto } from '@/features/shipping/api/shipping.dtos';

export async function getShippingEstimateDto(): Promise<ShippingEstimateDto | null> {
  if (!appEnv.apiBaseUrl) return null;

  const response = await apiClient.get<ShippingEstimateDto>('/shipping-estimate');
  return response.data ?? null;
}
