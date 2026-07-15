export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  session: (userId: string) => [...profileKeys.me(), userId] as const,
};
