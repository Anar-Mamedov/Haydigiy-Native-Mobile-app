import { apiClient } from '@/lib/axios';

export type AppVersionNumberResponseDto = {
  status?: string;
  data?: string | number | null;
};

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, max-age=0',
  Expires: '0',
  Pragma: 'no-cache',
} as const;

/** Returns the app version setting without leaking Axios into the feature layer. */
export async function getAppVersionNumberDto(): Promise<AppVersionNumberResponseDto> {
  const response = await apiClient.get<AppVersionNumberResponseDto>(
    '/settings/app_version_number',
    {
      headers: NO_CACHE_HEADERS,
      params: {
        _ts: Date.now(),
      },
    },
  );

  return response.data;
}
