import { z } from 'zod';
import { isValidTurkishIban } from '@/utils/iban';

export const paymentMethodSchema = z.object({
  // Stored as the raw 24 IBAN digits (without the `TR` prefix or spaces).
  iban: z
    .string()
    .min(1, { message: 'IBAN zorunludur' })
    .refine((value) => isValidTurkishIban(value), {
      message: 'Geçerli bir IBAN giriniz (TR + 24 hane).',
    }),
  ibanName: z
    .string()
    .trim()
    .min(1, { message: 'IBAN sahibi adı gereklidir' })
    .refine((value) => value.trim().split(/\s+/).length >= 2, {
      message: 'Lütfen ad ve soyadı boşlukla ayırarak giriniz.',
    }),
  isDefault: z.boolean(),
});

export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
