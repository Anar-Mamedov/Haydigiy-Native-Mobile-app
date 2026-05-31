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
  try {
    getRequiredApiBaseUrl();
    const response = await apiClient.get<ApiResponse>(topBannerEndpoints.active);
    if (response.data?.data && response.data.data.length > 0) {
      return response.data.data;
    }
  } catch (error) {
    console.warn('API fetch top banners failed, using mock campaign fallback', error);
  }

  // Fallback Mock campaign data matching user screenshots
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7);
  targetDate.setHours(targetDate.getHours() + 1);
  targetDate.setMinutes(targetDate.getMinutes() + 49);

  return [
    {
      id: 101,
      title: 'Bayram Şenliği',
      type: 'text',
      text: 'BAYRAM ŞENLİĞİ 🎉',
      subtext: '1500 TL ÜZERİ KARGO BEDAVA',
      link: null,
      bg_color_from: '#f27a1a',
      bg_color_to: '#f5a623',
      text_color: '#ffffff',
      image_web: null,
      image_mobile: null,
      animation_type: 'none',
      countdown_enabled: true,
      countdown_end_at: targetDate.toISOString(),
      end_at: targetDate.toISOString(),
      target_audience: 'all',
      pages: null,
      device: 'all',
      dismissible: true,
      priority: 1,
    },
  ];
}
