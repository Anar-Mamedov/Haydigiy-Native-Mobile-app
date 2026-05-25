export const pageDesignKeys = {
  all: ['pageDesign'] as const,
  mobile: () => [...pageDesignKeys.all, 'mobile'] as const,
};
