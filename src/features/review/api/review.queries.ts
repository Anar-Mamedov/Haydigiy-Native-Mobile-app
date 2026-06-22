import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { reviewKeys } from './review.keys';
import { mapMyReviews, MappedReviews } from './review.mapper';
import { getMyReviewsDto } from '@/services/review.service';
import { ReviewTabKey } from '@/types/review.types';

/** Loads the user's reviewable / reviewed products for a tab (`GET /review/my`). */
export function useMyReviewsQuery(tab: ReviewTabKey, enabled = true) {
  return useQuery<MappedReviews>({
    queryKey: reviewKeys.list(tab),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => mapMyReviews(await getMyReviewsDto(tab), tab),
  });
}
