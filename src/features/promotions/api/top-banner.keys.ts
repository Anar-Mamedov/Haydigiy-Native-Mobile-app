export const topBannerKeys = {
  all: ['topBanners'] as const,
  active: () => [...topBannerKeys.all, 'active'] as const,
};
