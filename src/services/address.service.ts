import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

export interface AddressDto {
  id: number;
  [key: string]: unknown;
}

/**
 * Fetches the authenticated user's saved addresses. Used by checkout to decide
 * whether an address must be added before preparing the order.
 */
export async function getAddressesDto(): Promise<AddressDto[]> {
  if (!appEnv.apiBaseUrl) return [];

  const response = await apiClient.get<AddressDto[]>('/addresses');
  return Array.isArray(response.data) ? response.data : [];
}
