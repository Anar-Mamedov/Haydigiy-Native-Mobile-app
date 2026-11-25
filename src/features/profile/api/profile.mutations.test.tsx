import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import * as userService from '@/services/user.service';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { useUpdateProfileMutation } from './profile.mutations';

jest.mock('@/services/user.service', () => ({
  changePasswordDto: jest.fn(),
  updateProfileDto: jest.fn(),
}));

const updateProfileDto = userService.updateProfileDto as jest.MockedFunction<
  typeof userService.updateProfileDto
>;

function createMutationHarness() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Infinity, retry: 1 },
      queries: { gcTime: Infinity, retry: false },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return { queryClient, wrapper };
}

describe('useUpdateProfileMutation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not retry a rejected profile update', async () => {
    const error = { response: { status: 422 } };
    updateProfileDto.mockRejectedValueOnce(error);
    const { queryClient, wrapper } = createMutationHarness();
    const { result, unmount } = renderHook(() => useUpdateProfileMutation(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          birth_date: null,
          email: 'anar26271@gmail.com',
          gender: 'male',
          name: 'Anar',
          phone: '5076534641',
          surname: 'Mamedov',
        }),
      ).rejects.toBe(error);
    });

    expect(updateProfileDto).toHaveBeenCalledTimes(1);
    unmount();
    queryClient.clear();
  });

  describe('v2 phone change', () => {
    const payload = {
      birth_date: null,
      email: 'anar26271@gmail.com',
      gender: 'male',
      name: 'Anar',
      phone: '5321234567',
      surname: 'Mamedov',
      version: 'v2' as const,
    };

    beforeEach(() => {
      useAuthStore.setState({
        user: { email: 'anar26271@gmail.com', id: '42', name: 'Anar', phoneNumber: '5551234567' },
      });
    });

    it('keeps the cache and the session untouched while the code is pending', async () => {
      // The first v2 call only sends an SMS code: nothing was saved on the backend.
      updateProfileDto.mockResolvedValueOnce({
        code_sent: true,
        success: true,
        verification_required: true,
      });
      const { queryClient, wrapper } = createMutationHarness();
      const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
      const { result, unmount } = renderHook(() => useUpdateProfileMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(payload);
      });

      expect(invalidateQueries).not.toHaveBeenCalled();
      expect(useAuthStore.getState().user?.phoneNumber).toBe('5551234567');
      unmount();
      queryClient.clear();
    });

    it('refreshes the profile and the session once the verified change is saved', async () => {
      updateProfileDto.mockResolvedValueOnce({ success: true });
      const { queryClient, wrapper } = createMutationHarness();
      const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
      const { result, unmount } = renderHook(() => useUpdateProfileMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ ...payload, verification_code: '123456' });
      });

      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['profile', 'me'] });
      expect(useAuthStore.getState().user?.phoneNumber).toBe('5321234567');
      unmount();
      queryClient.clear();
    });
  });

  describe('birth date in the session', () => {
    const payload = {
      birth_date: '1990-05-12',
      email: 'anar26271@gmail.com',
      gender: 'male',
      name: 'Anar',
      phone: '5551234567',
      surname: 'Mamedov',
    };

    beforeEach(() => {
      useAuthStore.setState({
        user: { email: 'anar26271@gmail.com', id: '42', name: 'Anar', phoneNumber: '5551234567' },
      });
    });

    async function save(response: userService.UpdateProfileResponseDto) {
      updateProfileDto.mockResolvedValueOnce(response);
      const { queryClient, wrapper } = createMutationHarness();
      const { result, unmount } = renderHook(() => useUpdateProfileMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(payload);
      });

      unmount();
      queryClient.clear();
    }

    it('stores the date the backend saved so Insider gets the current birthday', async () => {
      await save({ success: true, user: { birth_date: '1985-03-01' } });

      expect(useAuthStore.getState().user?.birthDate).toBe('1985-03-01');
    });

    it('falls back to the sent date when the response has no user', async () => {
      await save({ success: true });

      expect(useAuthStore.getState().user?.birthDate).toBe('1990-05-12');
    });
  });

  /** Insider'a giden telefon; telefon değişince eski numaranın E.164'ü oturumda kalmamalı. */
  describe('E.164 phone in the session', () => {
    const payload = {
      birth_date: null,
      email: 'anar26271@gmail.com',
      gender: 'male',
      name: 'Anar',
      phone: '5321234567',
      surname: 'Mamedov',
    };

    beforeEach(() => {
      useAuthStore.setState({
        user: {
          email: 'anar26271@gmail.com',
          id: '42',
          name: 'Anar',
          phoneE164: '+905551234567',
          phoneNumber: '5551234567',
        },
      });
    });

    async function save(response: userService.UpdateProfileResponseDto) {
      updateProfileDto.mockResolvedValueOnce(response);
      const { queryClient, wrapper } = createMutationHarness();
      const { result, unmount } = renderHook(() => useUpdateProfileMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(payload);
      });

      unmount();
      queryClient.clear();
    }

    it('stores the E.164 phone the backend saved', async () => {
      await save({ success: true, user: { phone: '5321234567', phone_e164: '+905321234567' } });

      expect(useAuthStore.getState().user).toEqual(
        expect.objectContaining({ phoneE164: '+905321234567', phoneNumber: '5321234567' }),
      );
    });

    it.each<[string, userService.UpdateProfileResponseDto]>([
      ['the response has no user', { success: true }],
      ['the backend does not return the field yet', { success: true, user: { phone: '5321234567' } }],
    ])('drops the previous number’s E.164 phone when %s', async (_label, response) => {
      await save(response);

      const { user } = useAuthStore.getState();
      expect(user?.phoneE164).toBeUndefined();
      expect(user?.phoneNumber).toBe('5321234567');
    });
  });
});
