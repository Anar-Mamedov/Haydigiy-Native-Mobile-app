import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { resolveSeoRedirectDto } from './seo-redirect.service';

jest.mock('@/lib/axios', () => ({
  apiClient: { get: jest.fn() },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.test' },
}));

const mockedGet = jest.mocked(apiClient.get);

describe('resolveSeoRedirectDto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appEnv.apiBaseUrl = 'https://api.test';
  });

  it('asks the resolve endpoint with the same path and query string as the web middleware', async () => {
    mockedGet.mockResolvedValue({
      data: { success: true, matched: true, status_code: 301, target_url: '/kadin-aksesuar?c=1' },
    });

    const result = await resolveSeoRedirectDto({ path: '/kolye-kupe-bileklik', queryString: 'c=216' });

    expect(mockedGet).toHaveBeenCalledWith('/seo/redirect-rules/resolve', {
      params: { path: '/kolye-kupe-bileklik', query_string: 'c=216' },
      timeout: 5000,
    });
    expect(result).toEqual({ success: true, matched: true, status_code: 301, target_url: '/kadin-aksesuar?c=1' });
  });

  it('returns no match for an empty response body', async () => {
    mockedGet.mockResolvedValue({ data: undefined });

    await expect(resolveSeoRedirectDto({ path: '/urun', queryString: '' })).resolves.toEqual({ matched: false });
  });

  it('does not call the API when no backend is configured', async () => {
    appEnv.apiBaseUrl = undefined;

    await expect(resolveSeoRedirectDto({ path: '/urun', queryString: '' })).resolves.toEqual({ matched: false });
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('lets request errors reach the query so the screen can fall back to 404', async () => {
    mockedGet.mockRejectedValue(new Error('timeout of 5000ms exceeded'));

    await expect(resolveSeoRedirectDto({ path: '/urun', queryString: '' })).rejects.toThrow('timeout');
  });
});
