export const appUpdateKeys = {
  all: ['app-update'] as const,
  latestVersion: () => [...appUpdateKeys.all, 'latest-version'] as const,
};
