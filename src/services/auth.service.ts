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
  remaining_seconds?: number | string;
}

export interface VerifyCodeResponse {
  message?: string;
  token?: string;
  user?: User & { phone?: string };
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

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message?: string;
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

export async function verifyCodeApi(payload: {
  type: 'phone';
  value: string;
  code: string;
}): Promise<VerifyCodeResponse> {
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

/** Completes a password reset with the single-use token from the e-mail/SMS link. */
export async function resetPasswordApi(
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> {
  if (!appEnv.apiBaseUrl) {
    return { message: 'Şifreniz başarıyla güncellendi.' };
  }

  const response = await apiClient.post('/auth/reset-password', payload);
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
 * Deletion contract version asked of `POST /auth/deactivate`. The endpoint stays
 * backwards compatible: omitting the version (or sending `v1`) closes the account
 * straight away, while `v2` requires an SMS code first.
 */
export type DeactivateAccountVersion = 'v1' | 'v2';

export interface DeactivateAccountPayload {
  version?: DeactivateAccountVersion;
  /** Only sent on the second `v2` call, once the user has typed the SMS code. */
  verification_code?: string;
}

export interface DeactivateAccountResponse {
  success?: boolean;
  message?: string;
  /** `true` while the account is still waiting for the SMS code to be confirmed. */
  verification_required?: boolean;
  code_sent?: boolean;
  remaining_seconds?: number | string;
  user_id?: number;
}

/**
 * Deactivates (deletes) the authenticated user's account (`POST /auth/deactivate`),
 * mirroring the web "Hesabımı Sil" flow. Under `v2` the first call only sends a
 * verification code; the account is closed by the follow-up call that carries
 * `verification_code`. Callers should clear the session and navigate away once the
 * response no longer asks for verification.
 */
export async function deactivateAccountApi(
  payload: DeactivateAccountPayload = {},
): Promise<DeactivateAccountResponse> {
  if (!appEnv.apiBaseUrl) {
    // Dev builds without a backend still walk through both steps of the v2 flow.
    if (payload.version === 'v2' && !payload.verification_code) {
      return { code_sent: true, remaining_seconds: 60, verification_required: true };
    }
    return { success: true };
  }

  const response = await apiClient.post('/auth/deactivate', payload);
  return response.data ?? {};
}
