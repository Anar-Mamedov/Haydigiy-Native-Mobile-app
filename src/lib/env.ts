const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const registerToken = process.env.EXPO_PUBLIC_REGISTER_TOKEN?.trim();

export const appEnv = {
  apiBaseUrl: apiBaseUrl && apiBaseUrl.length > 0 ? apiBaseUrl : undefined,
  registerToken: registerToken && registerToken.length > 0 ? registerToken : undefined,
};

export function getRequiredApiBaseUrl() {
  if (!appEnv.apiBaseUrl) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL is not configured. Set it before enabling live API requests.',
    );
  }

  return appEnv.apiBaseUrl;
}

export function getRequiredRegisterToken() {
  if (!appEnv.registerToken) {
    throw new Error(
      'EXPO_PUBLIC_REGISTER_TOKEN is not configured. Set it before enabling live registration requests.',
    );
  }

  return appEnv.registerToken;
}
