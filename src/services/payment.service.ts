import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

export interface PaymentMethodDto {
  id: number;
  iban: string;
  iban_name: string;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

interface PaymentMethodsResponseDto {
  data?: PaymentMethodDto[];
}

/**
 * Saved refund IBANs (`GET /payment-methods`), sorted default-first then newest,
 * matching the web payment-methods hook used by the return IBAN selector.
 */
export async function getPaymentMethodsDto(): Promise<PaymentMethodDto[]> {
  if (!appEnv.apiBaseUrl) return [];
  const response = await apiClient.get<PaymentMethodsResponseDto>('/payment-methods');
  const data = Array.isArray(response.data?.data) ? response.data.data : [];
  return [...data].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/** Adds a new refund IBAN (`POST /payment-methods`). */
export async function addPaymentMethodDto(input: {
  iban: string;
  ibanName: string;
  isDefault?: boolean;
}): Promise<void> {
  await apiClient.post('/payment-methods', {
    iban: input.iban,
    iban_name: input.ibanName,
    is_default: input.isDefault ?? false,
  });
}
