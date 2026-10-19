/** Query keys for the "Haydi Asistan" feature. */
export const assistantKeys = {
  all: ['assistant'] as const,
  config: () => [...assistantKeys.all, 'config'] as const,
};
