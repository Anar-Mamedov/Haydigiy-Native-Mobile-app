import { z } from 'zod';
import { CardFormValues } from '@/types/checkout.types';

/** BIN prefixes the gateway rejects; surfaced as a dedicated error on the card field. */
export const RESTRICTED_CARD_PREFIXES = ['5269', '5351'];

export function hasRestrictedCardPrefix(digits: string): boolean {
  const clean = digits.replace(/\D/g, '');
  return clean.length >= 4 && RESTRICTED_CARD_PREFIXES.some((p) => clean.startsWith(p));
}

/**
 * Validates the raw card fields (the number may contain grouping spaces). Used to
 * gate the "Onayla ve Bitir" button. Restricted BINs fail validation and are also
 * flagged separately so the UI can show a specific message.
 */
export const cardSchema = z
  .object({
    owner: z.string().trim().min(1, 'Kart üzerindeki ismi girin.'),
    number: z
      .string()
      .refine((value) => /^\d{16}$/.test(value.replace(/\s/g, '')), 'Geçerli bir kart numarası girin.'),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Ay seçin.'),
    expiryYear: z.string().regex(/^\d{2}$/, 'Yıl seçin.'),
    cvv: z.string().regex(/^\d{3}$/, 'CVV girin.'),
  })
  .refine((data) => !hasRestrictedCardPrefix(data.number), {
    message: 'Bu kartla ödeme yapılamaz.',
    path: ['number'],
  });

export function isValidCard(values: CardFormValues): boolean {
  return cardSchema.safeParse(values).success;
}
