import { z } from 'zod';
import { isValidTurkishMobile } from '@/utils/turkish-phone';
import { toPersonName } from '@/utils/normalize-text';

/** Same choices as the web profile form; the API accepts `male`, `female` and `other`. */
export const GENDER_OPTIONS = [
  { label: 'Erkek', value: 'male' },
  { label: 'Kadın', value: 'female' },
  { label: 'Diğer', value: 'other' },
];

export const BIRTH_DATE_INCOMPLETE_MESSAGE =
  'Doğum tarihini tamamlayın ya da tamamen temizleyin.';

export const userInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Ad zorunludur' })
    .min(2, { message: 'Ad en az 2 karakter olmalıdır' })
    .transform(toPersonName)
    .refine((value) => value.trim().length >= 2, { message: 'Ad en az 2 karakter olmalıdır' }),
  surname: z
    .string()
    .trim()
    .min(1, { message: 'Soyad zorunludur' })
    .min(2, { message: 'Soyad en az 2 karakter olmalıdır' })
    .transform(toPersonName)
    .refine((value) => value.trim().length >= 2, { message: 'Soyad en az 2 karakter olmalıdır' }),
  // Optional like on the web: accounts registered with a phone have no e-mail. A
  // filled-in address still has to be valid, which the backend enforces too.
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || z.email().safeParse(value).success, {
      message: 'Geçerli bir e-posta adresi giriniz',
    }),
  phone: z
    .string()
    .refine((value) => value.trim() === '' || isValidTurkishMobile(value), {
      message: 'Geçerli bir telefon numarası giriniz (5xxxxxxxxx)',
    }),
  gender: z.string(),
  day: z.string(),
  month: z.string(),
  year: z.string(),
}).superRefine((data, ctx) => {
  // A fully cleared date is sent as `null` (removes the saved one); a half-cleared
  // date would do the same by accident, so it has to be completed or cleared.
  const filledParts = [data.day, data.month, data.year].filter(Boolean).length;
  if (filledParts > 0 && filledParts < 3) {
    ctx.addIssue({ code: 'custom', message: BIRTH_DATE_INCOMPLETE_MESSAGE, path: ['day'] });
  }
});

export type UserInfoFormData = z.infer<typeof userInfoSchema>;
