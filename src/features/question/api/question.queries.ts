import { useInfiniteQuery } from '@tanstack/react-query';
import { questionKeys } from './question.keys';
import { mapMyQuestionsPage } from './question.mapper';
import { getMyQuestionsDto } from '@/services/question.service';
import { MyQuestionFilter } from '@/types/account-activity.types';

/**
 * Kullanıcının kendi soruları (`GET /question/my`), sonsuz kaydırmayla.
 * Son sayfada `getNextPageParam` `undefined` döner ve istek üretilmez.
 */
export function useMyQuestionsQuery(status: MyQuestionFilter, enabled = true) {
  return useInfiniteQuery({
    queryKey: questionKeys.list(status),
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => mapMyQuestionsPage(await getMyQuestionsDto(status, pageParam)),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.currentPage < lastPage.pagination.lastPage ? lastPage.pagination.currentPage + 1 : undefined,
  });
}
