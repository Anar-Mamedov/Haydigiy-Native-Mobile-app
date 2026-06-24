/** Query keys for the dedicated product Q&A page. */
export const productQuestionKeys = {
  all: ['product-questions'] as const,
  page: (slug: string, query: string) => [...productQuestionKeys.all, slug, query] as const,
};
