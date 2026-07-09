import { mergeCartDto } from './cart.service';
import { apiClient } from '@/lib/axios';

jest.mock('@/lib/axios', () => ({
  apiClient: {
    post: jest.fn(async () => ({ data: {} })),
  },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.test' },
}));

jest.mock('@/lib/storage/secure-storage', () => ({
  getAccessToken: jest.fn(async () => 'token-1'),
}));

jest.mock('@/lib/storage/device-id', () => ({
  getDeviceId: jest.fn(async () => 'device-1'),
}));

describe('mergeCartDto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('suppresses global network-error logging for the best-effort background merge', async () => {
    await mergeCartDto();

    expect(apiClient.post).toHaveBeenCalledWith(
      '/cart/merge',
      { device_id: 'device-1' },
      { skipNetworkErrorLog: true },
    );
  });
});
