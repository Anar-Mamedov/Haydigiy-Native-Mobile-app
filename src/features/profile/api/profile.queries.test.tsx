import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import * as userService from '@/services/user.service';
import { useUserProfileQuery } from './profile.queries';

jest.mock('@/services/user.service', () => ({
  getUserProfileDto: jest.fn(),
}));

const getUserProfileDto = userService.getUserProfileDto as jest.MockedFunction<
  typeof userService.getUserProfileDto
>;

function createQueryHarness() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return { queryClient, wrapper };
}

describe('useUserProfileQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      isLoading: false,
      user: { id: '8', email: 'anar@example.com', name: 'Anar' },
    });
  });

  afterEach(() => {
    useAuthStore.setState({ isLoading: false, user: null });
  });

  it('uses separate profile caches for consecutive authenticated users', async () => {
    getUserProfileDto
      .mockResolvedValueOnce({ user: { name: 'Anar' } })
      .mockResolvedValueOnce({ user: { name: 'İkinci Kullanıcı' } });
    const { queryClient, wrapper } = createQueryHarness();
    const { result, unmount } = renderHook(() => useUserProfileQuery(true), { wrapper });

    await waitFor(() => expect(result.current.data?.name).toBe('Anar'));

    act(() => {
      useAuthStore.setState({
        user: { id: '9', email: 'second@example.com', name: 'İkinci Kullanıcı' },
      });
    });

    await waitFor(() => expect(result.current.data?.name).toBe('İkinci Kullanıcı'));
    expect(getUserProfileDto).toHaveBeenCalledTimes(2);

    unmount();
    queryClient.clear();
  });
});
