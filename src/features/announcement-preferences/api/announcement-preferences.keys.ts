export const announcementPreferenceKeys = {
  all: ['announcement-preferences'] as const,
  /** Oturuma göre ayrılır; art arda giriş yapan kullanıcıların tercihleri karışmaz. */
  session: (userId: string) => [...announcementPreferenceKeys.all, userId] as const,
};
