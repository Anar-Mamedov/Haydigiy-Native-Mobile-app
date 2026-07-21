import { apiClient } from '@/lib/axios';
import { getAppVersionNumberDto } from './app-settings.service';

jest.mock('@/lib/axios', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const apiGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;

describe('getAppVersionNumberDto', () => {
  it('requests the app version setting through the shared API client', async () => {
    apiGet.mockResolvedValue({
      data: { status: 'success', data: '1' },
    } as never);

    await expect(getAppVersionNumberDto()).resolves.toEqual({
      status: 'success',
      data: '1',
    });
    expect(apiGet).toHaveBeenCalledWith('/settings/app_version_number');
  });
});
