import { z } from 'zod';
import { isValidTurkishMobile } from '@/utils/turkish-phone';

export const GENDER_OPTIONS = [
  { label: 'Erkek', value: 'male' },
  { label: 'Kadın', value: 'female' },
];

export const userInfoSchema = z.object({
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
  email: z
    .string()
    .trim()
    .min(1, { message: 'E-posta zorunludur' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz' }),
  phone: z
    .string()
    .refine((value) => value.trim() === '' || isValidTurkishMobile(value), {
      message: 'Geçerli bir telefon numarası giriniz (5xxxxxxxxx)',
    }),
  gender: z.string(),
  day: z.string(),
  month: z.string(),
  year: z.string(),
});

export type UserInfoFormData = z.infer<typeof userInfoSchema>;
