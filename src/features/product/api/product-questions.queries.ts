import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productQuestionKeys } from './product-questions.keys';
import { mapProductQuestionsPage, ProductQuestionsPage } from './product-questions.mapper';
import { askProductQuestionDto, getProductQuestionsDto } from '@/services/product.service';

/** Loads the dedicated product Q&A page (`GET /product/{slug}/question`). */
export function useProductQuestionsQuery(slug: string, query = '') {
  return useQuery<ProductQuestionsPage>({
    queryKey: productQuestionKeys.page(slug, query),
    enabled: Boolean(slug),
    queryFn: async () => {
      const dto = await getProductQuestionsDto(slug, query);
      return mapProductQuestionsPage(dto);
    },
  });
}

/** Submits a new product question and refreshes the Q&A list. */
export function useAskProductQuestionMutation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, question }: { productId: number; question: string }) =>
      askProductQuestionDto(productId, question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...productQuestionKeys.all, slug] });
    },
  });
}
