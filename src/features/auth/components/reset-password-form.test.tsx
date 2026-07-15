import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ResetPasswordForm } from './reset-password-form';

const mockMutateAsync = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  useFocusEffect: () => undefined,
}));

jest.mock('../api/auth.mutations', () => ({
  useResetPasswordMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe('ResetPasswordForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('submits the token and new password with the backend contract', async () => {
    const onSuccess = jest.fn();
    mockMutateAsync.mockResolvedValueOnce({ message: 'Şifreniz başarıyla güncellendi.' });
    renderWithTamagui(<ResetPasswordForm onSuccess={onSuccess} token="reset-token-123" />);

    fireEvent.changeText(screen.getByLabelText('Yeni Şifre'), 'secret1');
    fireEvent.changeText(screen.getByLabelText('Yeni Şifre (Tekrar)'), 'secret1');
    fireEvent.press(screen.getByText('Şifremi Güncelle'));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        token: 'reset-token-123',
        new_password: 'secret1',
      }),
    );
    expect(await screen.findByText('Şifreniz Güncellendi')).toBeTruthy();

    fireEvent.press(screen.getByText('Giriş Yap'));
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('does not submit mismatched passwords', async () => {
    renderWithTamagui(<ResetPasswordForm onSuccess={jest.fn()} token="reset-token-123" />);

    fireEvent.changeText(screen.getByLabelText('Yeni Şifre'), 'secret1');
    fireEvent.changeText(screen.getByLabelText('Yeni Şifre (Tekrar)'), 'secret2');
    fireEvent.press(screen.getByText('Şifremi Güncelle'));

    expect(await screen.findByText('Şifreler eşleşmiyor')).toBeTruthy();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows the API error when the token is invalid or expired', async () => {
    mockMutateAsync.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Geçersiz veya süresi dolmuş bağlantı.' } },
    });
    renderWithTamagui(<ResetPasswordForm onSuccess={jest.fn()} token="expired-token" />);

    fireEvent.changeText(screen.getByLabelText('Yeni Şifre'), 'secret1');
    fireEvent.changeText(screen.getByLabelText('Yeni Şifre (Tekrar)'), 'secret1');
    fireEvent.press(screen.getByText('Şifremi Güncelle'));

    expect(await screen.findByText('Geçersiz veya süresi dolmuş bağlantı.')).toBeTruthy();
  });
});
