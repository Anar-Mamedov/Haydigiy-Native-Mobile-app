import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import * as userService from '@/services/user.service';
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
});
