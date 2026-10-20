export const seoRedirectKeys = {
  all: ['seo-redirect'] as const,
  resolve: (path: string, queryString: string) => [...seoRedirectKeys.all, path, queryString] as const,
};
