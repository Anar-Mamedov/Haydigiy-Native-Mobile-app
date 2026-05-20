import { z } from 'zod';

export const checkoutSchema = z.object({
  addressLine: z.string().min(10, 'Address should be at least 10 characters long.'),
  email: z.string().email('Enter a valid email address.'),
  fullName: z.string().min(3, 'Full name should be at least 3 characters long.'),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
