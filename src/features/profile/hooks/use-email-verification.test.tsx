import { createElement, type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import * as authService from '@/services/auth.service';
import { useEmailVerification } from './use-email-verification';

jest.mock('@/services/auth.service', () => ({
  sendCodeApi: jest.fn(),
  verifyEmailCodeApi: jest.fn(),
}));

const sendCodeApi = authService.sendCodeApi as jest.MockedFunction<typeof authService.sendCodeApi>;
const verifyEmailCodeApi = authService.verifyEmailCodeApi as jest.MockedFunction<
  typeof authService.verifyEmailCodeApi
>;

const EMAIL = 'anar@example.com';

function apiError(status: number, data: Record<string, unknown>) {
  return Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: { data, status },
  });
}

function wrapper({ children }: PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  return createElement(QueryClientProvider, { client: queryClient }, children);
}

function renderVerification() {
  const onVerified = jest.fn();
  const rendered = renderHook(() => useEmailVerification({ email: EMAIL, onVerified }), { wrapper });
  return { ...rendered, onVerified };
}

async function openSheet(result: ReturnType<typeof renderVerification>['result']) {
  sendCodeApi.mockResolvedValueOnce({ message: 'Doğrulama kodu gönderildi.' });
  await act(async () => {
    await result.current.start();
  });
}

describe('useEmailVerification', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('start', () => {
    it('sends a code to the saved address and opens the sheet with the resend countdown', async () => {
      const { result } = renderVerification();

      await openSheet(result);

      expect(sendCodeApi).toHaveBeenCalledWith({ type: 'email', value: EMAIL });
      expect(result.current.isOpen).toBe(true);
      expect(result.current.cooldownSeconds).toBe(60);
      expect(result.current.infoMessage).toBe('Doğrulama kodu gönderildi.');
      expect(result.current.startError).toBeNull();
    });

    it('opens the sheet with the backend countdown when a code was sent moments ago', async () => {
      sendCodeApi.mockRejectedValueOnce(
        apiError(429, {
          message: 'Kodu tekrar göndermek için lütfen 42 saniye bekleyin.',
          remaining_seconds: 42,
        }),
      );
      const { result } = renderVerification();

      await act(async () => {
        await result.current.start();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.cooldownSeconds).toBe(42);
      expect(result.current.infoMessage).toMatch(/Kısa süre önce bir kod gönderildi/);
      expect(result.current.startError).toBeNull();
    });

    it('stays closed and reports a failed send beside the button', async () => {
      sendCodeApi.mockRejectedValueOnce(apiError(500, { message: 'Email gönderilemedi: SMTP' }));
      const { result } = renderVerification();

      await act(async () => {
        await result.current.start();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.startError).toBe('Email gönderilemedi: SMTP');
    });

    it('sends only one code for a double tap', async () => {
      let resolveSend: (value: { message: string }) => void = () => undefined;
      sendCodeApi.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
      );
      const { result } = renderVerification();

      await act(async () => {
        const first = result.current.start();
        const second = result.current.start();
        resolveSend({ message: 'Doğrulama kodu gönderildi.' });
        await Promise.all([first, second]);
      });

      expect(sendCodeApi).toHaveBeenCalledTimes(1);
    });
  });

  describe('submitCode', () => {
    it('asks for the full code before calling the backend', async () => {
      const { result } = renderVerification();
      await openSheet(result);

      act(() => result.current.setCode('123'));
      await act(async () => {
        await result.current.submitCode();
      });

      expect(verifyEmailCodeApi).not.toHaveBeenCalled();
      expect(result.current.errorMessage).toBe('Lütfen 6 haneli doğrulama kodunu girin.');
    });

    it('closes the sheet and reports success once the code is accepted', async () => {
      verifyEmailCodeApi.mockResolvedValueOnce(undefined);
      const { result, onVerified } = renderVerification();
      await openSheet(result);

      act(() => result.current.setCode('123456'));
      await act(async () => {
        await result.current.submitCode();
      });

      expect(verifyEmailCodeApi).toHaveBeenCalledWith({ email: EMAIL, code: '123456' });
      expect(result.current.isOpen).toBe(false);
      expect(onVerified).toHaveBeenCalledTimes(1);
    });

    it('shows the backend message and clears a rejected code', async () => {
      verifyEmailCodeApi.mockRejectedValueOnce(apiError(422, { message: 'Kod geçersiz veya süresi dolmuş.' }));
      const { result, onVerified } = renderVerification();
      await openSheet(result);

      act(() => result.current.setCode('000000'));
      await act(async () => {
        await result.current.submitCode();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.errorMessage).toBe('Kod geçersiz veya süresi dolmuş.');
      expect(result.current.code).toBe('');
      expect(onVerified).not.toHaveBeenCalled();
    });

    it('waits out the lock after too many wrong codes', async () => {
      verifyEmailCodeApi.mockRejectedValueOnce(
        apiError(429, {
          message: 'Çok fazla hatalı doğrulama denemesi. Lütfen 900 saniye sonra tekrar deneyin.',
          remaining_seconds: 900,
        }),
      );
      const { result } = renderVerification();
      await openSheet(result);

      act(() => result.current.setCode('000000'));
      await act(async () => {
        await result.current.submitCode();
      });

      expect(result.current.cooldownSeconds).toBe(900);
      expect(result.current.errorMessage).toMatch(/Çok fazla hatalı doğrulama denemesi/);
    });
  });

  describe('resendCode', () => {
    it('restarts the countdown with a fresh code', async () => {
      const { result } = renderVerification();
      await openSheet(result);
      sendCodeApi.mockResolvedValueOnce({ message: 'Doğrulama kodu gönderildi.' });

      act(() => result.current.setCode('12'));
      await act(async () => {
        await result.current.resendCode();
      });

      expect(sendCodeApi).toHaveBeenCalledTimes(2);
      expect(result.current.cooldownSeconds).toBe(60);
      expect(result.current.infoMessage).toBe('Doğrulama kodu gönderildi.');
      expect(result.current.code).toBe('');
    });

    it('reports a refused resend with the backend countdown', async () => {
      const { result } = renderVerification();
      await openSheet(result);
      sendCodeApi.mockRejectedValueOnce(
        apiError(429, { message: 'Kodu tekrar göndermek için lütfen 30 saniye bekleyin.', remaining_seconds: 30 }),
      );

      await act(async () => {
        await result.current.resendCode();
      });

      expect(result.current.cooldownSeconds).toBe(30);
      expect(result.current.errorMessage).toBe('Kodu tekrar göndermek için lütfen 30 saniye bekleyin.');
    });
  });

  it('cancel closes the sheet and drops the typed code', async () => {
    const { result } = renderVerification();
    await openSheet(result);

    act(() => result.current.setCode('123'));
    act(() => result.current.cancel());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.code).toBe('');
  });
});
