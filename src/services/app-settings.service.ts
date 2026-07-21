import { apiClient } from '@/lib/axios';

export type AppVersionNumberResponseDto = {
  status?: string;
  data?: string | number | null;
};

/** Returns the app version setting without leaking Axios into the feature layer. */
export async function getAppVersionNumberDto(): Promise<AppVersionNumberResponseDto> {
  const response = await apiClient.get<AppVersionNumberResponseDto>(
    '/settings/app_version_number',
  );

  return response.data;
}
