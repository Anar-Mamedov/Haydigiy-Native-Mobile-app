import { createElement, type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import * as userService from '@/services/user.service';
import type { UpdateProfilePayloadDto } from '@/services/user.service';
import { useProfileUpdate } from './use-profile-update';

jest.mock('@/services/user.service', () => ({
  updateProfileDto: jest.fn(),
}));

const updateProfileDto = userService.updateProfileDto as jest.MockedFunction<
  typeof userService.updateProfileDto
>;

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

function createPayload(): UpdateProfilePayloadDto {
  return {
    birth_date: '1990-05-08',
    email: 'anar@example.com',
    gender: 'male',
    name: 'Anar',
    phone: '5321234567',
    surname: 'Mamedov',
    version: 'v2',
  };
}

const CODE_SENT = {
  code_sent: true,
  expires_in: 300,
  message: 'Doğrulama kodu yeni telefon numaranıza gönderildi.',
  resend_after: 60,
  success: true,
  verification_required: true,
};

function renderProfileUpdate() {
  const onPhoneVerified = jest.fn();
  const rendered = renderHook(() => useProfileUpdate({ onPhoneVerified }), { wrapper });
  return { ...rendered, onPhoneVerified };
}

async function openVerification(result: ReturnType<typeof renderProfileUpdate>['result'], payload = createPayload()) {
  updateProfileDto.mockResolvedValueOnce(CODE_SENT);
  let outcome: string | undefined;
  await act(async () => {
    outcome = await result.current.save(payload);
  });
  return { outcome, payload };
}

describe('useProfileUpdate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('saves directly when no code is needed', async () => {
    updateProfileDto.mockResolvedValueOnce({ message: 'Profil başarıyla güncellendi.' });
    const { result } = renderProfileUpdate();

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.save(createPayload());
    });

    expect(outcome).toBe('saved');
    expect(result.current.isVerificationOpen).toBe(false);
  });

  it('opens the code step when the backend sends a code to the new number', async () => {
    const { result, onPhoneVerified } = renderProfileUpdate();
    const { outcome } = await openVerification(result);

    expect(outcome).toBe('verification-required');
    expect(updateProfileDto).toHaveBeenCalledWith(createPayload());
    expect(result.current.isVerificationOpen).toBe(true);
    expect(result.current.pendingPhone).toBe('5321234567');
    expect(result.current.cooldownSeconds).toBe(60);
    expect(result.current.infoMessage).toBe('Doğrulama kodu yeni telefon numaranıza gönderildi.');
    expect(onPhoneVerified).not.toHaveBeenCalled();
  });

  it('verifies with the frozen first payload, never with later edits', async () => {
    // Regression: the code is bound to the number of the first call. Edits made while
    // the code screen is open (or a tampered field) must not reach the second call.
    const { result } = renderProfileUpdate();
    const { payload } = await openVerification(result);
    payload.phone = '5559999999';
    payload.name = 'Değişti';

    updateProfileDto.mockResolvedValueOnce({ success: true });
    act(() => result.current.setCode('123456'));
    await act(async () => {
      await result.current.submitCode();
    });

    expect(updateProfileDto).toHaveBeenLastCalledWith(
      { ...createPayload(), verification_code: '123456' });
  });

  it('does not send another save while a code is pending', async () => {
    const { result } = renderProfileUpdate();
    await openVerification(result);

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.save({ ...createPayload(), phone: '5559999999' });
    });

    expect(outcome).toBe('verification-required');
    expect(updateProfileDto).toHaveBeenCalledTimes(1);
  });

  it('closes the code step and reports success once the code is accepted', async () => {
    const { result, onPhoneVerified } = renderProfileUpdate();
    await openVerification(result);

    updateProfileDto.mockResolvedValueOnce({
      message: 'Telefon numaranız doğrulandı ve profiliniz güncellendi.',
      success: true,
    });
    act(() => result.current.setCode('123456'));
    await act(async () => {
      await result.current.submitCode();
    });

    expect(onPhoneVerified).toHaveBeenCalledTimes(1);
    expect(result.current.isVerificationOpen).toBe(false);
    expect(result.current.pendingPhone).toBeNull();
  });

  it('asks for a complete code before calling the backend', async () => {
    const { result } = renderProfileUpdate();
    await openVerification(result);

    act(() => result.current.setCode('123'));
    await act(async () => {
      await result.current.submitCode();
    });

    expect(updateProfileDto).toHaveBeenCalledTimes(1);
    expect(result.current.errorMessage).toBe('Lütfen 6 haneli doğrulama kodunu girin.');
  });

  it('shows the attempts left for a wrong code and clears it', async () => {
    const { result, onPhoneVerified } = renderProfileUpdate();
    await openVerification(result);

    updateProfileDto.mockRejectedValueOnce(
      apiError(422, {
        message: 'Doğrulama kodu hatalı.',
        remaining_attempts: 3,
        success: false,
        verification_required: true,
      }),
    );
    act(() => result.current.setCode('111111'));
    await act(async () => {
      await result.current.submitCode();
    });

    expect(result.current.errorMessage).toBe('Doğrulama kodu hatalı. Kalan deneme hakkınız: 3.');
    expect(result.current.code).toBe('');
    expect(result.current.isVerificationOpen).toBe(true);
    expect(onPhoneVerified).not.toHaveBeenCalled();
  });

  it('lets a new code be requested at once when the attempts run out', async () => {
    const { result } = renderProfileUpdate();
    await openVerification(result);

    updateProfileDto.mockRejectedValueOnce(
      apiError(429, {
        message: 'Çok fazla hatalı deneme yapıldı. Lütfen yeni doğrulama kodu isteyin.',
        remaining_attempts: 0,
        success: false,
        verification_required: true,
      }),
    );
    act(() => result.current.setCode('111111'));
    await act(async () => {
      await result.current.submitCode();
    });

    expect(result.current.cooldownSeconds).toBe(0);
    expect(result.current.errorMessage).toBe(
      'Çok fazla hatalı deneme yapıldı. Lütfen yeni doğrulama kodu isteyin.',
    );
  });

  it('resends the code for the same frozen payload and restarts the countdown', async () => {
    const { result } = renderProfileUpdate();
    const { payload } = await openVerification(result);
    payload.phone = '5559999999';

    updateProfileDto.mockResolvedValueOnce(CODE_SENT);
    await act(async () => {
      await result.current.resendCode();
    });

    expect(updateProfileDto).toHaveBeenLastCalledWith(createPayload());
    expect(result.current.cooldownSeconds).toBe(60);
    expect(result.current.infoMessage).toBe('Doğrulama kodu yeni telefon numaranıza gönderildi.');
  });

  it('shows the backend countdown when a new code is asked for too early', async () => {
    const { result } = renderProfileUpdate();
    await openVerification(result);

    updateProfileDto.mockRejectedValueOnce(
      apiError(429, {
        message: 'Doğrulama kodunu tekrar göndermek için lütfen 42 saniye bekleyin.',
        remaining_seconds: 42,
        success: false,
        verification_required: true,
      }),
    );
    await act(async () => {
      await result.current.resendCode();
    });

    expect(result.current.cooldownSeconds).toBe(42);
    expect(result.current.errorMessage).toBe(
      'Doğrulama kodunu tekrar göndermek için lütfen 42 saniye bekleyin.',
    );
  });

  it('reopens the code step when the form is sent again inside the resend window', async () => {
    updateProfileDto.mockRejectedValueOnce(
      apiError(429, {
        message: 'Doğrulama kodunu tekrar göndermek için lütfen 30 saniye bekleyin.',
        remaining_seconds: 30,
        success: false,
        verification_required: true,
      }),
    );
    const { result } = renderProfileUpdate();

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.save(createPayload());
    });

    expect(outcome).toBe('verification-required');
    expect(result.current.isVerificationOpen).toBe(true);
    expect(result.current.cooldownSeconds).toBe(30);
  });

  it('rethrows ordinary errors so the form can show them', async () => {
    const error = apiError(422, {
      message: 'Bu telefon numarası başka bir kullanıcı tarafından kullanılıyor.',
      success: false,
    });
    updateProfileDto.mockRejectedValueOnce(error);
    const { result } = renderProfileUpdate();

    await act(async () => {
      await expect(result.current.save(createPayload())).rejects.toBe(error);
    });
    expect(result.current.isVerificationOpen).toBe(false);
  });

  it('drops the pending payload when the code step is cancelled', async () => {
    const { result } = renderProfileUpdate();
    await openVerification(result);

    act(() => result.current.cancelVerification());
    expect(result.current.isVerificationOpen).toBe(false);

    updateProfileDto.mockResolvedValueOnce({ message: 'Profil başarıyla güncellendi.' });
    await act(async () => {
      await result.current.save({ ...createPayload(), phone: '5551234567' });
    });

    expect(updateProfileDto).toHaveBeenLastCalledWith(
      { ...createPayload(), phone: '5551234567' });
  });
});
