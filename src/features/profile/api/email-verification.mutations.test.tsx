import { createElement, type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import * as authService from '@/services/auth.service';
import {
  useSendEmailVerificationCodeMutation,
  useVerifyEmailCodeMutation,
} from './email-verification.mutations';
import { profileKeys } from './profile.keys';

jest.mock('@/services/auth.service', () => ({
  sendCodeApi: jest.fn(),
  verifyEmailCodeApi: jest.fn(),
}));

const sendCodeApi = authService.sendCodeApi as jest.MockedFunction<typeof authService.sendCodeApi>;
const verifyEmailCodeApi = authService.verifyEmailCodeApi as jest.MockedFunction<
  typeof authService.verifyEmailCodeApi
>;

function createHarness() {
  // retry: 1 as the default proves the hooks switch retries off themselves.
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: 1 }, queries: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return { queryClient, wrapper };
}

describe('email verification mutations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends an e-mail code to the given address without retrying a refusal', async () => {
    const error = { response: { status: 429 } };
    sendCodeApi.mockRejectedValueOnce(error);
    const { wrapper } = createHarness();
    const { result } = renderHook(() => useSendEmailVerificationCodeMutation(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('anar@example.com')).rejects.toBe(error);
    });

    expect(sendCodeApi).toHaveBeenCalledTimes(1);
    expect(sendCodeApi).toHaveBeenCalledWith({ type: 'email', value: 'anar@example.com' });
  });

  it('refetches the profile once the code is accepted', async () => {
    verifyEmailCodeApi.mockResolvedValueOnce(undefined);
    const { queryClient, wrapper } = createHarness();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useVerifyEmailCodeMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ email: 'anar@example.com', code: '123456' });
    });

    expect(verifyEmailCodeApi).toHaveBeenCalledWith({ email: 'anar@example.com', code: '123456' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: profileKeys.me() });
  });

  it('neither retries nor refetches a rejected code', async () => {
    const error = { response: { status: 422 } };
    verifyEmailCodeApi.mockRejectedValueOnce(error);
    const { queryClient, wrapper } = createHarness();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useVerifyEmailCodeMutation(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ email: 'anar@example.com', code: '000000' }),
      ).rejects.toBe(error);
    });

    expect(verifyEmailCodeApi).toHaveBeenCalledTimes(1);
    expect(invalidate).not.toHaveBeenCalled();
  });
});
