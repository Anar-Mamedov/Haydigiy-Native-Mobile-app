import { ReviewTabKey } from '@/types/review.types';

export const reviewKeys = {
  all: ['my-reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (tab: ReviewTabKey) => [...reviewKeys.lists(), tab] as const,
};
