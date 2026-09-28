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
});
