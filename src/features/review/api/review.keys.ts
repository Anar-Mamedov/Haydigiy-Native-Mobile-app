import { ReviewTabKey } from '@/types/review.types';
import { MyReviewFilter } from '@/types/account-activity.types';

export const reviewKeys = {
  all: ['my-reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (tab: ReviewTabKey) => [...reviewKeys.lists(), tab] as const,
  /** Kullanıcının kendi yorumları (`/review/my-reviews`); sayfalar sonsuz sorguda tutulur. */
  entries: (status: MyReviewFilter) => [...reviewKeys.all, 'entries', status] as const,
};
