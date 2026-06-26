import { apiClient } from '@/lib/axios';

/**
 * İyzico installment-rate lookup. This is a RATE/BIN data endpoint used to show
 * installment plans for the card; the actual installment payment is processed by
 * İyzico 3DS. Mirrors the web `CardInformation` installment lookup.
 */

export interface InstallmentPriceDto {
  installmentPrice: number;
  totalPrice: number;
  installmentNumber: number;
}

export interface InstallmentResponseDto {
  status?: string;
  message?: string;
  installmentDetails?: {
    cardFamilyName?: string;
    installmentPrices?: InstallmentPriceDto[];
  }[];
}

/** Installment plans for an 8-digit BIN + amount (`POST /iyzico-prod/installments`). */
export async function getInstallmentsDto(
  binNumber: string,
  price: number,
): Promise<InstallmentResponseDto> {
  const response = await apiClient.post<InstallmentResponseDto>('/iyzico-prod/installments', {
    binNumber,
    price,
  });
  return response.data;
}
