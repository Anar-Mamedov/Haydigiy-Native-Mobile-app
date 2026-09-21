import { createElement, type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useAccountDeletion } from './use-account-deletion';
import * as authService from '@/services/auth.service';

const mockLogout = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, replace: mockReplace }),
}));

jest.mock('@/features/auth/store/use-auth-store', () => ({
  useAuthStore: (selector: (state: { logout: () => Promise<void> }) => unknown) =>
    selector({ logout: mockLogout }),
}));

jest.mock('@/services/auth.service', () => ({
  deactivateAccountApi: jest.fn(),
}));

const deactivateAccountApi = authService.deactivateAccountApi as jest.MockedFunction<
  typeof authService.deactivateAccountApi
>;

function wrapper({ children }: PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  return createElement(QueryClientProvider, { client: queryClient }, children);
}

function renderAccountDeletion() {
  return renderHook(() => useAccountDeletion(), { wrapper });
}

describe('useAccountDeletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
  });

  it('asks for a v2 code and opens the verification step', async () => {
    deactivateAccountApi.mockResolvedValueOnce({
      code_sent: true,
      message: 'Doğrulama kodu gönderildi.',
      remaining_seconds: 60,
      verification_required: true,
    });

    const { result } = renderAccountDeletion();
    await act(async () => {
      await result.current.startDeletion();
    });

    expect(deactivateAccountApi).toHaveBeenCalledWith({ version: 'v2' }, expect.anything());
    expect(result.current.isVerificationOpen).toBe(true);
    expect(result.current.isConfirmOpen).toBe(false);
    expect(result.current.cooldownSeconds).toBe(60);
    expect(result.current.infoMessage).toBe('Doğrulama kodu gönderildi.');
    // The account must not be closed yet — no code has been confirmed.
    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('closes the account and signs out once the code is verified', async () => {
    deactivateAccountApi
      .mockResolvedValueOnce({ code_sent: true, verification_required: true })
      .mockResolvedValueOnce({ message: 'Hesabınız silindi.', success: true });

    const { result } = renderAccountDeletion();
    await act(async () => {
      await result.current.startDeletion();
    });

    act(() => result.current.setCode('123456'));
    await act(async () => {
      await result.current.submitCode();
    });

    expect(deactivateAccountApi).toHaveBeenLastCalledWith(
      { verification_code: '123456', version: 'v2' },
      expect.anything(),
    );
    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(result.current.isVerificationOpen).toBe(false);
  });

  it('signs the user out directly when the backend does not ask for a code', async () => {
    // A v1 deployment (or an older backend that ignores `version`) already closed
    // the account on the first call, so the session must not be left behind.
    deactivateAccountApi.mockResolvedValueOnce({ success: true, user_id: 7 });

    const { result } = renderAccountDeletion();
    await act(async () => {
      await result.current.startDeletion();
    });

    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    expect(result.current.isVerificationOpen).toBe(false);
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('shows the backend message for a wrong code and keeps the session', async () => {
    deactivateAccountApi
      .mockResolvedValueOnce({ code_sent: true, verification_required: true })
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { message: 'Doğrulama kodu hatalı. 4 hakkınız kaldı.' }, status: 422 },
      });

    const { result } = renderAccountDeletion();
    await act(async () => {
      await result.current.startDeletion();
    });

    act(() => result.current.setCode('000000'));
    await act(async () => {
      await result.current.submitCode();
    });

    expect(result.current.errorMessage).toBe('Doğrulama kodu hatalı. 4 hakkınız kaldı.');
    expect(result.current.code).toBe('');
    expect(result.current.isVerificationOpen).toBe(true);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('refuses to submit an incomplete code without calling the endpoint', async () => {
    deactivateAccountApi.mockResolvedValueOnce({ code_sent: true, verification_required: true });

    const { result } = renderAccountDeletion();
    await act(async () => {
      await result.current.startDeletion();
    });

    act(() => result.current.setCode('123'));
    await act(async () => {
      await result.current.submitCode();
    });

    expect(deactivateAccountApi).toHaveBeenCalledTimes(1);
    expect(result.current.errorMessage).toBe('Lütfen 6 haneli doğrulama kodunu girin.');
  });

  it('applies the backend cooldown when a resend is refused', async () => {
    deactivateAccountApi
      .mockResolvedValueOnce({ code_sent: true, verification_required: true })
      .mockRejectedValueOnce({
        response: { data: { message: 'Lütfen 42 saniye bekleyin.', remaining_seconds: 42 } },
      });

    const { result } = renderAccountDeletion();
    await act(async () => {
      await result.current.startDeletion();
    });

    await act(async () => {
      await result.current.resendCode();
    });

    expect(result.current.errorMessage).toBe('Lütfen 42 saniye bekleyin.');
    expect(result.current.cooldownSeconds).toBe(42);
  });

  it('reports a failed start without opening the code screen', async () => {
    deactivateAccountApi.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Kayıtlı telefon numaranız bulunamadı.' }, status: 400 },
    });

    const { result } = renderAccountDeletion();
    await act(async () => {
      await result.current.startDeletion();
    });

    expect(result.current.startError).toBe('Kayıtlı telefon numaranız bulunamadı.');
    expect(result.current.isVerificationOpen).toBe(false);
    expect(mockLogout).not.toHaveBeenCalled();
  });
});
