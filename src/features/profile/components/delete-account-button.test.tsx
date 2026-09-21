import { Alert } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { DeleteAccountButton } from './delete-account-button';
import { renderWithTamagui } from '@/test/render-with-tamagui';
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

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(
      View,
      { testID: 'delete-account-verification-sheet', ...props },
      children,
    );
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, props);
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

const deactivateAccountApi = authService.deactivateAccountApi as jest.MockedFunction<
  typeof authService.deactivateAccountApi
>;

describe('DeleteAccountButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
  });

  it('opens a destructive confirmation when pressed', () => {
    renderWithTamagui(<DeleteAccountButton />);

    fireEvent.press(screen.getByLabelText('Hesabımı Sil'));
    expect(screen.getByText('Hesabınızı Silmek İstediğinize Emin Misiniz?')).toBeTruthy();
  });

  it('asks for a verification code before closing the account', async () => {
    deactivateAccountApi.mockResolvedValueOnce({
      code_sent: true,
      remaining_seconds: 60,
      verification_required: true,
    });

    renderWithTamagui(<DeleteAccountButton />);

    fireEvent.press(screen.getByLabelText('Hesabımı Sil'));
    fireEvent.press(screen.getByText('Evet, Sil'));

    await waitFor(() =>
      expect(deactivateAccountApi).toHaveBeenCalledWith({ version: 'v2' }, expect.anything()),
    );
    await waitFor(() => expect(screen.getByText('Hesap Silme Doğrulaması')).toBeTruthy());
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('deactivates the account and signs out once the code is verified', async () => {
    deactivateAccountApi
      .mockResolvedValueOnce({ code_sent: true, verification_required: true })
      .mockResolvedValueOnce({ message: 'Hesabınız silindi.', success: true });

    renderWithTamagui(<DeleteAccountButton />);

    fireEvent.press(screen.getByLabelText('Hesabımı Sil'));
    fireEvent.press(screen.getByText('Evet, Sil'));

    const codeInput = await screen.findByLabelText('6 haneli hesap silme doğrulama kodu');
    fireEvent.changeText(codeInput, '123456');
    fireEvent.press(screen.getByLabelText('Hesabımı sil'));

    await waitFor(() =>
      expect(deactivateAccountApi).toHaveBeenLastCalledWith(
        { verification_code: '123456', version: 'v2' },
        expect.anything(),
      ),
    );
    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
  });

  it('signs out immediately when the backend closes the account without a code', async () => {
    deactivateAccountApi.mockResolvedValueOnce({ success: true, user_id: 3 });

    renderWithTamagui(<DeleteAccountButton />);

    fireEvent.press(screen.getByLabelText('Hesabımı Sil'));
    fireEvent.press(screen.getByText('Evet, Sil'));

    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
    expect(screen.queryByText('Hesap Silme Doğrulaması')).toBeNull();
  });

  it('alerts with the backend message when the code cannot be sent', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    deactivateAccountApi.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Kayıtlı telefon numaranız bulunamadı.' }, status: 400 },
    });

    renderWithTamagui(<DeleteAccountButton />);

    fireEvent.press(screen.getByLabelText('Hesabımı Sil'));
    fireEvent.press(screen.getByText('Evet, Sil'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'Hata',
        'Kayıtlı telefon numaranız bulunamadı.',
        expect.any(Array),
      ),
    );
    expect(mockLogout).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
