import { useQuery } from '@tanstack/react-query';
import { appUpdateKeys } from './app-update.keys';
import { mapAppVersionNumber } from './app-version.mapper';
import { getAppVersionNumberDto } from '@/services/app-settings.service';

export function useLatestAppVersionQuery(enabled = true) {
  return useQuery({
    enabled,
    queryKey: appUpdateKeys.latestVersion(),
    queryFn: async () => mapAppVersionNumber(await getAppVersionNumberDto()),
    refetchOnMount: 'always',
    staleTime: 0,
  });
}
