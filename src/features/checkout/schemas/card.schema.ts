import { z } from 'zod';
import { CardFormValues } from '@/types/checkout.types';

/**
 * Validates the raw card fields (the number may contain grouping spaces). Used to
 * gate the "Onayla ve Bitir" button. No BIN is rejected here: which gateway a card
 * can pay through is the backend `/payment-router`'s decision.
 */
export const cardSchema = z.object({
  owner: z.string().trim().min(1, 'Kart üzerindeki ismi girin.'),
  number: z
    .string()
    .refine((value) => /^\d{16}$/.test(value.replace(/\s/g, '')), 'Geçerli bir kart numarası girin.'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Ay seçin.'),
  expiryYear: z.string().regex(/^\d{2}$/, 'Yıl seçin.'),
  cvv: z.string().regex(/^\d{3}$/, 'CVV girin.'),
});

export function isValidCard(values: CardFormValues): boolean {
  return cardSchema.safeParse(values).success;
}
