import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { fastLoginVerifyApi, loginApi, logoutApi, verifyCodeApi } from './auth.service';

jest.mock('@/lib/axios', () => ({
  apiClient: { post: jest.fn() },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.test' },
  getRequiredRegisterToken: jest.fn(),
}));

const mockPost = apiClient.post as jest.Mock;

describe('logoutApi', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockPost.mockResolvedValue({ data: { success: true } });
    appEnv.apiBaseUrl = 'https://api.test';
  });

  it('revokes the current token with a short timeout and no network error log', async () => {
    await logoutApi();

    expect(mockPost).toHaveBeenCalledWith('/auth/logout', undefined, {
      skipNetworkErrorLog: true,
      timeout: 5000,
    });
  });

  it('lets the caller decide what a failed request means', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'));

    await expect(logoutApi()).rejects.toThrow('Network Error');
  });

  it('sends nothing in mock mode without an API base URL', async () => {
    appEnv.apiBaseUrl = undefined;

    await logoutApi();

    expect(mockPost).not.toHaveBeenCalled();
  });
});

/**
 * Insider'a giden telefon backend'in biçimlendirdiği `phone_e164`'tür; kullanıcıyı
 * döndüren her giriş yolu alanı domain `phoneE164`'e taşımalı.
 */
describe('auth user normalization', () => {
  const rawUser = {
    id: 42,
    email: 'user@example.com',
    name: 'Ayşe',
    phone: '5321234567',
    phone_e164: '+905321234567',
    email_verified: true,
    birth_date: '1990-05-12',
  };

  beforeEach(() => {
    mockPost.mockReset();
    appEnv.apiBaseUrl = 'https://api.test';
  });

  it.each([
    ['password login', () => loginApi({ email: 'user@example.com', password: 'x' })],
    ['OTP verification', () => verifyCodeApi({ type: 'phone', value: '5321234567', code: '1' })],
    [
      'fast login',
      () => fastLoginVerifyApi({ type: 'phone', identifier: '5321234567', code: '1' }),
    ],
  ])('maps phone_e164 onto phoneE164 for %s', async (_label, call) => {
    mockPost.mockResolvedValueOnce({ data: { token: 'jwt', user: rawUser } });

    const { user } = await call();

    expect(user).toEqual(
      expect.objectContaining({
        birthDate: '1990-05-12',
        emailVerified: true,
        phone: '5321234567',
        phoneE164: '+905321234567',
      }),
    );
    // Ham anahtar oturuma girmez: sonraki bir spread telefon değişince onu taşımasın.
    expect(user).not.toHaveProperty('phone_e164');
  });

  it('leaves phoneE164 empty when the backend does not return the field yet', async () => {
    const { phone_e164: _omitted, ...withoutE164 } = rawUser;
    mockPost.mockResolvedValueOnce({ data: { token: 'jwt', user: withoutE164 } });

    const { user } = await loginApi({ email: 'user@example.com', password: 'x' });

    expect(user.phoneE164).toBeNull();
  });
});
