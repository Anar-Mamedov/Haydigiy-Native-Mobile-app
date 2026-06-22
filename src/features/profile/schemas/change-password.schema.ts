import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: 'Şifre en az 8 karakter olmalıdır' })
      .regex(/[A-Z]/, { message: 'Şifre en az 1 büyük harf içermelidir' })
      .regex(/[a-z]/, { message: 'Şifre en az 1 küçük harf içermelidir' })
      .regex(/[0-9]/, { message: 'Şifre en az 1 rakam içermelidir' }),
    confirmPassword: z.string().min(1, { message: 'Şifre tekrarı zorunludur' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
