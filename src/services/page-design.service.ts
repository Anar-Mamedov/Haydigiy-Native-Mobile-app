import { apiClient } from '@/lib/axios';
import { getRequiredApiBaseUrl } from '@/lib/env';
import { PageDesign } from '@/types/page-design.types';

export const pageDesignEndpoints = {
  mobile: '/page-designs/mobile',
};

interface ApiResponse {
  status: string;
  data: PageDesign;
}

export async function fetchMobilePageDesign(): Promise<PageDesign> {
  getRequiredApiBaseUrl();
  const response = await apiClient.get<ApiResponse>(pageDesignEndpoints.mobile);
  return response.data.data;
}

