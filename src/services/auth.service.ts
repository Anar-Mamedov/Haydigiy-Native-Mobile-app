import { apiClient } from '@/lib/axios';
import { appEnv, getRequiredRegisterToken } from '@/lib/env';
import { User } from '@/types/auth.types';

export interface LoginResponse {
  token: string;
  user: User & { phone?: string };
}

/**
 * Maps the raw backend user onto the domain User, normalizing the verification
 * flag (`email_verified` → `emailVerified`) so screens consume a stable shape.
 * All other fields are preserved as-is.
 */
function normalizeAuthUser(raw: (User & { phone?: string; email_verified?: boolean }) | undefined) {
  if (!raw) return raw;
  const verified =
    typeof raw.emailVerified === 'boolean'
      ? raw.emailVerified
      : typeof raw.email_verified === 'boolean'
        ? raw.email_verified
        : undefined;
  return { ...raw, emailVerified: verified };
}

export interface RegisterResponse {
  token?: string;
  user?: User & { phone?: string };
  message?: string;
}

export interface RegisterPayload {
  name: string;
  surname: string;
  country_code: string;
  phone: string;
  email: string;
  password: string;
  kvkk_consent: boolean;
  communication_consent: boolean;
}

export interface SendCodeResponse {
  message: string;
  remaining_seconds?: number;
}

export interface FastLoginInitResponse {
  message?: string;
  is_new_user?: boolean;
  type?: 'phone' | 'email';
  identifier?: string;
  remaining_seconds?: number;
}

export type ForgotPasswordPayload =
  | {
      type: 'email';
      email: string;
    }
  | {
      type: 'phone';
      country_code: '+90';
      phone: string;
    };

export interface ForgotPasswordResponse {
  message?: string;
  remaining_seconds?: number;
}

export async function loginApi(payload: any): Promise<LoginResponse> {
  if (!appEnv.apiBaseUrl) {
    // Mock Mode
    return {
      token: 'mock-jwt-token-123',
      user: {
        id: 'mock-user-1',
        email: payload.email || 'mock@example.com',
        name: 'Geliştirici',
        surname: 'Kullanıcı',
        phoneNumber: payload.phone || '5555555555',
        phone: payload.phone || '5555555555',
      },
    };
  }

  const response = await apiClient.post('/auth/login', payload);
  return { ...response.data, user: normalizeAuthUser(response.data?.user) };
}

export async function registerApi(payload: RegisterPayload): Promise<RegisterResponse> {
  if (!appEnv.apiBaseUrl) {
    // Mock Mode
    return {
      message: 'Doğrulama kodu gönderildi.',
    };
  }

  const response = await apiClient.post('/auth/register', {
    ...payload,
    token: getRequiredRegisterToken(),
  });
  return response.data;
}

export async function sendCodeApi(payload: { type: 'phone'; value: string }): Promise<SendCodeResponse> {
  if (!appEnv.apiBaseUrl) {
    // Mock Mode
    return {
      message: 'Doğrulama kodu tekrar gönderildi.',
      remaining_seconds: 60,
    };
  }

  const response = await apiClient.post('/auth/send-code', payload);
  return response.data;
}

export async function verifyCodeApi(payload: { type: 'phone'; value: string; code: string }): Promise<LoginResponse> {
  if (!appEnv.apiBaseUrl) {
    // Mock Mode
    return {
      token: 'mock-jwt-token-123',
      user: {
        id: 'mock-user-1',
        email: 'mock@example.com',
        name: 'Geliştirici',
        surname: 'Kullanıcı',
        phoneNumber: payload.value,
        phone: payload.value,
      },
    };
  }

  const response = await apiClient.post('/auth/verify-code', payload);
  return { ...response.data, user: normalizeAuthUser(response.data?.user) };
}

export async function fastLoginInitApi(payload: { identifier: string }): Promise<FastLoginInitResponse> {
  if (!appEnv.apiBaseUrl) {
    return {
      message: 'Doğrulama kodu gönderildi.',
      is_new_user: false,
      type: 'phone',
      identifier: payload.identifier,
      remaining_seconds: 60,
    };
  }

  const response = await apiClient.post('/auth/fast-login/init', payload);
  return response.data;
}

/**
 * Starts the same password-reset flow used by the web application. The backend
 * sends a reset link for e-mail accounts or a reset code for phone accounts.
 */
export async function forgotPasswordApi(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
  if (!appEnv.apiBaseUrl) {
    return {
      message:
        payload.type === 'email'
          ? 'Şifre yenileme bağlantısı e-posta adresinize gönderildi.'
          : 'Şifre yenileme kodu SMS ile telefon numaranıza gönderildi.',
      remaining_seconds: 60,
    };
  }

  const response = await apiClient.post('/auth/forgot-password', payload);
  return response.data;
}

export async function fastLoginVerifyApi(payload: {
  type: 'phone' | 'email';
  identifier: string;
  code: string;
  kvkk_consent?: boolean;
  communication_consent?: boolean;
  device_info?: any;
}): Promise<LoginResponse> {
  if (!appEnv.apiBaseUrl) {
    return {
      token: 'mock-jwt-token-123',
      user: {
        id: 'mock-user-1',
        email: payload.type === 'email' ? payload.identifier : 'mock@example.com',
        name: 'Geliştirici',
        surname: 'Kullanıcı',
        phoneNumber: payload.type === 'phone' ? payload.identifier : '5555555555',
        phone: payload.type === 'phone' ? payload.identifier : '5555555555',
      },
    };
  }

  const response = await apiClient.post('/auth/fast-login/verify', payload);
  return { ...response.data, user: normalizeAuthUser(response.data?.user) };
}


/**
 * Deactivates (deletes) the authenticated user's account (`POST /auth/deactivate`),
 * mirroring the web "Hesabımı Sil" flow. Callers should clear the session and
 * navigate away on success.
 */
export async function deactivateAccountApi(): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  await apiClient.post('/auth/deactivate');
}
