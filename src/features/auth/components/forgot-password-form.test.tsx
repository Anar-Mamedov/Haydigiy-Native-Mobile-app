import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ForgotPasswordForm } from './forgot-password-form';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockMutateAsync = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  useFocusEffect: () => undefined,
}));

jest.mock('../api/auth.mutations', () => ({
  useForgotPasswordMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe('ForgotPasswordForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('submits the web-compatible e-mail reset request and confirms delivery', async () => {
    mockMutateAsync.mockResolvedValueOnce({ remaining_seconds: 60 });
    renderWithTamagui(<ForgotPasswordForm onBackToLogin={jest.fn()} />);

    fireEvent.changeText(screen.getByLabelText('E-posta veya Telefon Numarası'), 'user@example.com');
    fireEvent.press(screen.getByText('Şifremi Yenile'));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        type: 'email',
        email: 'user@example.com',
      }),
    );
    expect(screen.getByText('Bağlantı Gönderildi')).toBeTruthy();
    expect(screen.getByText(/e-posta adresinize gönderildi/)).toBeTruthy();
  });

  it('does not call the API for an invalid identifier', async () => {
    renderWithTamagui(<ForgotPasswordForm onBackToLogin={jest.fn()} />);

    fireEvent.changeText(screen.getByLabelText('E-posta veya Telefon Numarası'), 'invalid');
    fireEvent.press(screen.getByText('Şifremi Yenile'));

    await waitFor(() => expect(screen.getByText('Geçerli bir e-posta adresi giriniz.')).toBeTruthy());
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('normalizes a phone number to the backend password-reset contract', async () => {
    mockMutateAsync.mockResolvedValueOnce({ remaining_seconds: 60 });
    renderWithTamagui(<ForgotPasswordForm onBackToLogin={jest.fn()} />);

    fireEvent.changeText(screen.getByLabelText('E-posta veya Telefon Numarası'), '0532 123 45 67');
    fireEvent.press(screen.getByText('Şifremi Yenile'));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        type: 'phone',
        country_code: '+90',
        phone: '5321234567',
      }),
    );
  });

  it('shows a 429 lock message as-is and blocks the request until the window ends', async () => {
    const lockMessage =
      'Çok fazla hatalı doğrulama kodu girdiniz. Lütfen 3 dakika 55 saniye sonra tekrar deneyin.';
    mockMutateAsync.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: lockMessage, remaining_attempts: 0, remaining_seconds: 235 }, status: 429 },
    });
    renderWithTamagui(<ForgotPasswordForm onBackToLogin={jest.fn()} />);

    fireEvent.changeText(screen.getByLabelText('E-posta veya Telefon Numarası'), '0532 123 45 67');
    fireEvent.press(screen.getByText('Şifremi Yenile'));

    expect(await screen.findByText(lockMessage)).toBeTruthy();
    expect(screen.getByText('Kalan Süre: 03:55')).toBeTruthy();
    fireEvent.press(screen.getByText('Kalan Süre: 03:55'));
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
  });
});
