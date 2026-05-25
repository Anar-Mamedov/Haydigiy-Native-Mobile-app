import { apiClient } from '@/lib/axios';
import { getRequiredApiBaseUrl } from '@/lib/env';
import { TopBannerData } from '../types/top-banner.types';

export const topBannerEndpoints = {
  active: '/top-banner/active',
};

interface ApiResponse {
  status: string;
  data: TopBannerData[];
}

export async function fetchActiveTopBanners(): Promise<TopBannerData[]> {
  getRequiredApiBaseUrl();
  const response = await apiClient.get<ApiResponse>(topBannerEndpoints.active);
  return response.data.data || [];
}
