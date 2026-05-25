import { useQuery } from '@tanstack/react-query';
import { topBannerKeys } from './top-banner.keys';
import { fetchActiveTopBanners } from '../services/top-banner.service';

export function useActiveTopBannersQuery() {
  return useQuery({
    queryFn: fetchActiveTopBanners,
    queryKey: topBannerKeys.active(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
