const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const appEnv = {
  apiBaseUrl: apiBaseUrl && apiBaseUrl.length > 0 ? apiBaseUrl : undefined,
};

export function getRequiredApiBaseUrl() {
  if (!appEnv.apiBaseUrl) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL is not configured. Set it before enabling live API requests.',
    );
  }

  return appEnv.apiBaseUrl;
}
