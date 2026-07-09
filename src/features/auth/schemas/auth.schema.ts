import { z } from 'zod';
import { isValidTurkishMobile } from '@/utils/turkish-phone';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'E-posta adresi veya telefon numarası zorunludur' }),
  password: z
    .string()
    .min(1, { message: 'Şifre zorunludur' })
    .min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
}).superRefine((data, ctx) => {
  const trimmed = data.identifier.trim();
  if (trimmed.includes('@') || /[a-zA-Z]/.test(trimmed)) {
    const isEmail = z.string().email().safeParse(trimmed).success;
    if (!isEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Geçerli bir e-posta adresi giriniz.',
        path: ['identifier'],
      });
    }
  } else {
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (!/^5[0-9]{9}$/.test(digitsOnly)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Geçerli bir telefon numarası giriniz (5xxxxxxxxx).',
        path: ['identifier'],
      });
    }
  }
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Ad zorunludur' })
    .min(2, { message: 'Ad en az 2 karakter olmalıdır' }),
  surname: z
    .string()
    .min(1, { message: 'Soyad zorunludur' })
    .min(2, { message: 'Soyad en az 2 karakter olmalıdır' }),
  phone: z
    .string()
    .min(1, { message: 'Telefon numarası zorunludur' })
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, '');
        return /^5[0-9]{9}$/.test(digitsOnly);
      },
      { message: 'Telefon numarası 5 ile başlamalı ve 10 haneli olmalı' },
    ),
  password: z
    .string()
    .min(1, { message: 'Şifre zorunludur' })
    .min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
  kvkk: z.boolean().refine((val) => val === true, {
    message: 'KVKK onayı zorunludur',
  }),
  commercial: z.boolean(),
});

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, { message: 'Doğrulama kodu 6 haneli olmalıdır' })
    .regex(/^\d+$/, { message: 'Doğrulama kodu sadece sayılardan oluşmalıdır' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'E-posta adresi veya telefon numarası zorunludur' }),
}).superRefine((data, ctx) => {
  const trimmed = data.identifier.trim();
  if (trimmed.includes('@') || /[a-zA-Z]/.test(trimmed)) {
    const isEmail = z.string().email().safeParse(trimmed).success;
    if (!isEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Geçerli bir e-posta adresi giriniz.',
        path: ['identifier'],
      });
    }
    return;
  }

  const digitsOnly = trimmed.replace(/\D/g, '');
  if (!/^5[0-9]{9}$/.test(digitsOnly)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Geçerli bir telefon numarası giriniz (5xxxxxxxxx).',
      path: ['identifier'],
    });
  }
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const fastLoginSchema = z.object({
  phone: z
    .string()
    .min(1, { message: 'Telefon numarası zorunludur' })
    .refine((val) => isValidTurkishMobile(val), {
      message: 'Geçerli bir telefon numarası giriniz (05XX XXX XX XX).',
    }),
});

export type FastLoginFormData = z.infer<typeof fastLoginSchema>;
