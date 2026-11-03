const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const registerToken = process.env.EXPO_PUBLIC_REGISTER_TOKEN?.trim();
/** Yalnız yerelde Haydi Asistan mock sunucusuna yönlendirmek için (yoksa `apiBaseUrl` kullanılır). */
const assistantApiBaseUrl = process.env.EXPO_PUBLIC_ASSISTANT_API_BASE_URL?.trim();
/** Yeni geri bildirim formunun (customer_feedback_v2) açıldığı kurulum yüzdesi: 0 (kapalı) … 100. */
const customerFeedbackV2Percent = process.env.EXPO_PUBLIC_CUSTOMER_FEEDBACK_V2_PERCENT?.trim();

/** Yüzde değerini doğrular: boş, sayı olmayan ya da aralık dışı değer güvenli tarafa (0 = kapalı) düşer. */
export function parseRolloutPercent(raw: string | undefined): number {
  if (!raw || !/^\d{1,3}$/.test(raw)) return 0;
  const percent = Number(raw);
  return percent >= 0 && percent <= 100 ? percent : 0;
}

export const appEnv = {
  apiBaseUrl: apiBaseUrl && apiBaseUrl.length > 0 ? apiBaseUrl : undefined,
  registerToken: registerToken && registerToken.length > 0 ? registerToken : undefined,
  assistantApiBaseUrl: assistantApiBaseUrl && assistantApiBaseUrl.length > 0 ? assistantApiBaseUrl : undefined,
  customerFeedbackV2Percent: parseRolloutPercent(customerFeedbackV2Percent),
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
