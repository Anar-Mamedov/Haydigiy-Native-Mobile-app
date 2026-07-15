import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import * as authService from '@/services/auth.service';
import { useSendCodeMutation, useVerifyCodeMutation } from './auth.mutations';

jest.mock('@/services/auth.service', () => ({
  deactivateAccountApi: jest.fn(),
  fastLoginInitApi: jest.fn(),
  fastLoginVerifyApi: jest.fn(),
  forgotPasswordApi: jest.fn(),
  loginApi: jest.fn(),
  registerApi: jest.fn(),
  resetPasswordApi: jest.fn(),
  sendCodeApi: jest.fn(),
  verifyCodeApi: jest.fn(),
}));

const sendCodeApi = authService.sendCodeApi as jest.MockedFunction<typeof authService.sendCodeApi>;
const verifyCodeApi = authService.verifyCodeApi as jest.MockedFunction<
  typeof authService.verifyCodeApi
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

describe('OTP auth mutations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not retry a rejected send-code request', async () => {
    const error = { response: { status: 422 } };
    sendCodeApi.mockRejectedValueOnce(error);
    const { queryClient, wrapper } = createMutationHarness();
    const { result, unmount } = renderHook(() => useSendCodeMutation(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ type: 'phone', value: '5076534634' }),
      ).rejects.toBe(error);
    });

    expect(sendCodeApi).toHaveBeenCalledTimes(1);
    unmount();
    queryClient.clear();
  });

  it('does not retry a rejected verify-code request', async () => {
    const error = { response: { status: 422 } };
    verifyCodeApi.mockRejectedValueOnce(error);
    const { queryClient, wrapper } = createMutationHarness();
    const { result, unmount } = renderHook(() => useVerifyCodeMutation(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ code: '123456', type: 'phone', value: '5076534634' }),
      ).rejects.toBe(error);
    });

    expect(verifyCodeApi).toHaveBeenCalledTimes(1);
    unmount();
    queryClient.clear();
  });
});
