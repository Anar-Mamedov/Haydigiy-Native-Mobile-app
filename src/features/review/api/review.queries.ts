import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { reviewKeys } from './review.keys';
import { mapMyReviewEntriesPage, mapMyReviews, MappedReviews } from './review.mapper';
import { getMyReviewEntriesDto, getMyReviewsDto } from '@/services/review.service';
import { ReviewTabKey } from '@/types/review.types';
import { MyReviewFilter } from '@/types/account-activity.types';

/** Loads the user's reviewable / reviewed products for a tab (`GET /review/my`). */
export function useMyReviewsQuery(tab: ReviewTabKey, enabled = true) {
  return useQuery<MappedReviews>({
    queryKey: reviewKeys.list(tab),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => mapMyReviews(await getMyReviewsDto(tab), tab),
  });
}

/**
 * Kullanıcının kendi yorumları (`GET /review/my-reviews`), sonsuz kaydırmayla.
 * Liste ekranı `meta.last_page`e bakarak bir sonraki sayfayı ister; son sayfada
 * `undefined` dönerek istek üretmeyi bırakır.
 */
export function useMyReviewEntriesQuery(status: MyReviewFilter, enabled = true) {
  return useInfiniteQuery({
    queryKey: reviewKeys.entries(status),
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => mapMyReviewEntriesPage(await getMyReviewEntriesDto(status, pageParam)),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.currentPage < lastPage.pagination.lastPage ? lastPage.pagination.currentPage + 1 : undefined,
  });
}
