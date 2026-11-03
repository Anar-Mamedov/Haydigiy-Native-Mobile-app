import { z } from 'zod';
import type { FeedbackCategory, FeedbackFormValues } from '@/types/customer-feedback.types';
import { collectFeedbackIssues } from '../utils/feedback-validation';

/**
 * Seçili kategoriye göre kurulan form şeması. Sorular sunucudan geldiği için şema da dinamiktir;
 * kurallar `collectFeedbackIssues` içinde tek yerde durur, hata yolları sunucu anahtarlarıyla aynıdır.
 */
export function buildCustomerFeedbackSchema(category: FeedbackCategory | null) {
  return z.custom<FeedbackFormValues>().superRefine((values, ctx) => {
    if (!category) return;
    for (const [path, message] of Object.entries(collectFeedbackIssues(category, values))) {
      ctx.addIssue({ code: 'custom', path: path.split('.'), message });
    }
  });
}

export const EMPTY_FEEDBACK_VALUES: FeedbackFormValues = {
  answers: {},
  message: '',
  full_name: '',
  email: '',
  phone: '',
};
