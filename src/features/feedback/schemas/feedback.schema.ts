import { z } from 'zod';
import { FEEDBACK_TEXTS } from '../constants/feedback-texts';

/** Web ile aynı kural: boşluklardan arındırılmış mesaj boş olamaz; gönderilen metin kırpılır. */
export const feedbackSchema = z.object({
  message: z.string().trim().min(1, { message: FEEDBACK_TEXTS.required }),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
