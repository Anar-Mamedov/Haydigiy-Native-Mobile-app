import { apiClient } from '@/lib/axios';
import {
  getAnnouncementPreferencesDto,
  updateAnnouncementPreferencesDto,
} from './announcement-preferences.service';

jest.mock('@/lib/axios', () => ({
  apiClient: { get: jest.fn(), put: jest.fn() },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.example.com' },
}));

const mockGet = apiClient.get as jest.Mock;
const mockPut = apiClient.put as jest.Mock;

describe('announcement-preferences.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads preferences from the backend preferences route', async () => {
    mockGet.mockResolvedValue({ data: { notify_email: true, notify_sms: false, notify_call: false } });

    await expect(getAnnouncementPreferencesDto()).resolves.toEqual({
      notify_email: true,
      notify_sms: false,
      notify_call: false,
    });
    expect(mockGet).toHaveBeenCalledWith('/auth/preferences');
  });

  it('saves all three flags with the web payload', async () => {
    mockPut.mockResolvedValue({ data: { message: 'ok', data: { notify_email: false } } });
    const payload = { notify_email: false, notify_sms: true, notify_call: true };

    await expect(updateAnnouncementPreferencesDto(payload)).resolves.toEqual({
      message: 'ok',
      data: { notify_email: false },
    });
    expect(mockPut).toHaveBeenCalledWith('/auth/preferences', payload);
  });
});
