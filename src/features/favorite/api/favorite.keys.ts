export const favoriteKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoriteKeys.all, 'list'] as const,
  list: (query?: string) => [...favoriteKeys.lists(), { query }] as const,
};
