import { z } from 'zod';
import { isValidTurkishMobile } from '@/utils/turkish-phone';
import { isValidTurkishId } from '../utils/turkish-id';

export const INVOICE_TYPE_OPTIONS = [
  { label: 'Bireysel', value: 'individual' as const },
  { label: 'Kurumsal', value: 'corporate' as const },
];

export const addressSchema = z
  .object({
    title: z.string().trim().min(1, { message: 'Adres başlığı zorunludur' }),
    name: z
      .string()
      .trim()
      .min(1, { message: 'Ad zorunludur' })
      .min(2, { message: 'Ad en az 2 karakter olmalıdır' }),
    surname: z
      .string()
      .trim()
      .min(1, { message: 'Soyad zorunludur' })
      .min(2, { message: 'Soyad en az 2 karakter olmalıdır' }),
    phone: z
      .string()
      .min(1, { message: 'Telefon zorunludur' })
      .refine(isValidTurkishMobile, {
        message: 'Geçerli bir telefon numarası giriniz (5xxxxxxxxx)',
      }),
    tcNumber: z
      .string()
      .refine((value) => value.trim() === '' || isValidTurkishId(value), {
        message: 'Geçerli bir T.C. Kimlik No giriniz',
      }),
    cityId: z.string().min(1, { message: 'İl seçimi zorunludur' }),
    districtId: z.string().min(1, { message: 'İlçe seçimi zorunludur' }),
    neighbourhoodId: z.string().min(1, { message: 'Mahalle seçimi zorunludur' }),
    addressLine: z.string().trim().min(1, { message: 'Adres zorunludur' }),
    invoiceType: z.enum(['individual', 'corporate']),
    taxNumber: z.string(),
    taxOffice: z.string(),
    companyName: z.string(),
    isEFatura: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.invoiceType !== 'corporate') return;
    if (!data.taxNumber.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['taxNumber'], message: 'VKN/TCKN zorunludur' });
    }
    if (!data.taxOffice.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['taxOffice'],
        message: 'Vergi Dairesi zorunludur',
      });
    }
    if (!data.companyName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['companyName'],
        message: 'Firma Adı zorunludur',
      });
    }
  });

export type AddressFormData = z.infer<typeof addressSchema>;
