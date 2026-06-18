import { ReturnMethod } from '@/types/order.types';

export type ReturnSuccessParams = {
  cargoCompanyName: string | null;
  returnMethod: ReturnMethod;
  code?: string;
  expiresAt?: string;
  selectedDate?: string | null;
};

/** Base "talep alındı" line, including the return code + expiry when present. */
export function buildReturnBaseMessage(code?: string, expiresAt?: string): string {
  if (!code) return 'İade talebiniz başarıyla alındı.';
  const expiry = expiresAt ? `\nKod geçerlilik: ${expiresAt}` : '';
  return `İade talebiniz alındı.\nİade Kodunuz: ${code}${expiry}`;
}

/**
 * Builds the success message shown after a return is created, mirroring the web
 * flow: store returns are simple, Hepsijet pickups prepend the appointment line.
 */
export function buildReturnSuccessMessage({
  cargoCompanyName,
  returnMethod,
  code,
  expiresAt,
  selectedDate,
}: ReturnSuccessParams): string {
  if (cargoCompanyName === 'Mağazadan Al') {
    return 'İade talebiniz başarıyla alındı.';
  }
  const base = buildReturnBaseMessage(code, expiresAt);
  if (returnMethod === 'hepsijet' && selectedDate) {
    return `Randevunuz oluşturuldu!\nKurye ${selectedDate} tarihinde adresinizden iadenizi alacaktır.\n\n${base}`;
  }
  return base;
}
