import { Alert, StyleSheet } from 'react-native';
import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { APP_LIGHT_THEME_COLORS } from '@/lib/theme/app-theme-colors';
import * as authService from '@/services/auth.service';
import { EmailVerificationPrompt } from './email-verification-prompt';

jest.mock('@/services/auth.service', () => ({
  ...jest.requireActual('@/services/auth.service'),
  sendCodeApi: jest.fn(),
  verifyEmailCodeApi: jest.fn(),
}));

const sendCodeApi = authService.sendCodeApi as jest.MockedFunction<typeof authService.sendCodeApi>;
const verifyEmailCodeApi = authService.verifyEmailCodeApi as jest.MockedFunction<
  typeof authService.verifyEmailCodeApi
>;

const EMAIL = 'anar@example.com';

describe('EmailVerificationPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  it('shows the web card: warning text and a filled "Doğrula" button', () => {
    renderWithTamagui(<EmailVerificationPrompt email={EMAIL} />);

    expect(screen.getByText('E-Posta Adresinizi Doğrulamanız Gerekmektedir')).toBeTruthy();
    expect(screen.getByLabelText('E-posta adresini doğrula')).toBeTruthy();

    const card = StyleSheet.flatten(screen.getByTestId('email-verification-card').props.style);
    expect(card.backgroundColor).toBe(APP_LIGHT_THEME_COLORS.noticeBackground);
    // Tamagui expands `borderColor` into the four side colors.
    expect(card.borderTopColor ?? card.borderColor).toBe(APP_LIGHT_THEME_COLORS.noticeBorder);
  });

  it('sends a code to the saved address and opens the code sheet', async () => {
    sendCodeApi.mockResolvedValueOnce({ message: 'Doğrulama kodu gönderildi.' });
    renderWithTamagui(<EmailVerificationPrompt email={EMAIL} />);

    fireEvent.press(screen.getByLabelText('E-posta adresini doğrula'));

    // The closed sheet stays mounted, so its title is always in the tree; the info
    // message is only set once the sheet opens after a sent code.
    expect(await screen.findByText('Doğrulama kodu gönderildi.')).toBeTruthy();
    expect(sendCodeApi).toHaveBeenCalledWith({ type: 'email', value: EMAIL });
    expect(screen.getByText(/anar@example.com adresine 6 haneli/)).toBeTruthy();
  });

  it('confirms the code and reports success', async () => {
    sendCodeApi.mockResolvedValueOnce({ message: 'Doğrulama kodu gönderildi.' });
    verifyEmailCodeApi.mockResolvedValueOnce(undefined);
    renderWithTamagui(<EmailVerificationPrompt email={EMAIL} />);

    fireEvent.press(screen.getByLabelText('E-posta adresini doğrula'));
    await screen.findByText('Doğrulama kodu gönderildi.');
    fireEvent.changeText(screen.getByLabelText('6 haneli e-posta doğrulama kodu'), '123456');
    fireEvent.press(screen.getByLabelText('E-postayı doğrula'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Başarılı', 'E-posta adresiniz doğrulandı.'),
    );
    expect(verifyEmailCodeApi).toHaveBeenCalledWith({ email: EMAIL, code: '123456' });
  });

  it('shows why the code could not be sent and lets the user try again', async () => {
    sendCodeApi.mockRejectedValueOnce(
      Object.assign(new Error('Request failed with status code 500'), {
        isAxiosError: true,
        response: { data: { message: 'Email gönderilemedi: SMTP' }, status: 500 },
      }),
    );
    renderWithTamagui(<EmailVerificationPrompt email={EMAIL} />);

    fireEvent.press(screen.getByLabelText('E-posta adresini doğrula'));

    expect(await screen.findByText('Email gönderilemedi: SMTP')).toBeTruthy();
    // The button is back to "Doğrula" and accepts another try.
    expect(within(screen.getByTestId('email-verification-start')).getByText('Doğrula')).toBeTruthy();
    expect(screen.queryByText('Gönderiliyor...')).toBeNull();
  });

  it('stays readable in dark mode', () => {
    renderWithTamagui(<EmailVerificationPrompt email={EMAIL} />, 'dark');

    expect(screen.getByText('E-Posta Adresinizi Doğrulamanız Gerekmektedir')).toBeTruthy();
    expect(screen.getByLabelText('E-posta adresini doğrula')).toBeTruthy();
  });
});
