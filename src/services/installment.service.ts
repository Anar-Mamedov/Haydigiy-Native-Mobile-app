import { apiClient } from '@/lib/axios';

/**
 * Installment-rate lookup for a card BIN. This is a RATE/BIN data endpoint used to
 * show installment plans; it starts no payment. The backend `/payment-router`
 * answers with the active installment gateway's plans (VakıfBank or İyzico, chosen
 * in the panel), so the app never picks the bank itself. Mirrors the web
 * `CardInformation` installment lookup.
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

/** Installment plans for an 8-digit BIN + amount (`POST /payment-router/installments`). */
export async function getInstallmentsDto(
  binNumber: string,
  price: number,
): Promise<InstallmentResponseDto> {
  const response = await apiClient.post<InstallmentResponseDto>('/payment-router/installments', {
    binNumber,
    price,
  });
  return response.data;
}
