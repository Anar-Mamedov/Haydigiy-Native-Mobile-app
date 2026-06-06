import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { TopBannerData } from '../types/top-banner.types';

export const topBannerEndpoints = {
  active: '/top-banner/active',
};

interface ApiResponse {
  status: string;
  data: TopBannerData[];
}

/**
 * Active top banners come entirely from the backend, which can fully
 * enable/disable the campaign. When there is no active campaign, the API errors,
 * or the base URL is not configured, return an empty list so nothing is shown —
 * matching the web frontend (no hardcoded fallback campaign).
 */
export async function fetchActiveTopBanners(): Promise<TopBannerData[]> {
  if (!appEnv.apiBaseUrl) return [];

  try {
    const response = await apiClient.get<ApiResponse>(topBannerEndpoints.active);
    return Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (error) {
    console.warn('Failed to fetch active top banners', error);
    return [];
  }
}
