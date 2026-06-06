import { fetchActiveTopBanners } from './top-banner.service';
import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

jest.mock('@/lib/axios', () => ({
  apiClient: { get: jest.fn() },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.example.com' },
}));

const mockGet = apiClient.get as jest.Mock;

describe('fetchActiveTopBanners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (appEnv as { apiBaseUrl?: string }).apiBaseUrl = 'https://api.example.com';
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns the active banners from the API', async () => {
    const banners = [{ id: 1, title: 'Kampanya' }];
    mockGet.mockResolvedValue({ data: { status: 'ok', data: banners } });

    await expect(fetchActiveTopBanners()).resolves.toEqual(banners);
  });

  it('returns an empty list when the campaign is disabled (empty data)', async () => {
    mockGet.mockResolvedValue({ data: { status: 'ok', data: [] } });

    await expect(fetchActiveTopBanners()).resolves.toEqual([]);
  });

  // Regression: the old implementation returned a hardcoded "BAYRAM ŞENLİĞİ"
  // campaign on error, so the banner showed even with no active campaign.
  it('returns an empty list when the API errors (no mock fallback)', async () => {
    mockGet.mockRejectedValue(new Error('timeout of 15000ms exceeded'));

    await expect(fetchActiveTopBanners()).resolves.toEqual([]);
  });

  it('returns an empty list and does not call the API when no base URL is configured', async () => {
    (appEnv as { apiBaseUrl?: string }).apiBaseUrl = undefined;

    await expect(fetchActiveTopBanners()).resolves.toEqual([]);
    expect(mockGet).not.toHaveBeenCalled();
  });
});
