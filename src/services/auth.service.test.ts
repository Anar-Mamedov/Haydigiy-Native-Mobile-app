import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { logoutApi } from './auth.service';

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
