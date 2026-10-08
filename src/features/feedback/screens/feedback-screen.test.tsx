import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { sendFeedbackDto } from '@/services/feedback.service';
import { FeedbackScreen } from './feedback-screen';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, push: jest.fn(), replace: mockReplace }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

jest.mock('@/features/auth/hooks/use-auth-status', () => ({
  useAuthStatus: jest.fn(),
}));

jest.mock('@/services/feedback.service', () => ({
  sendFeedbackDto: jest.fn(),
}));

const mockAuthStatus = useAuthStatus as jest.Mock;
const mockSend = sendFeedbackDto as jest.Mock;

const messageInput = () => screen.getByLabelText('Geri bildiriminiz');
const submitButton = () => screen.getByText('Gönder');

function axiosError(status: number, data: unknown) {
  return new AxiosError('fail', String(status), undefined, undefined, {
    config: { headers: new AxiosHeaders() },
    data,
    headers: {},
    status,
    statusText: '',
  });
}

describe('FeedbackScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStatus.mockReturnValue({ isAuthenticated: true, isLoading: false });
  });

  it.each(['light', 'dark'] as const)('renders the web texts and an accessible field in %s theme', (theme) => {
    renderWithTamagui(<FeedbackScreen />, theme);

    expect(screen.getByText('Geri Bildirim Yapın')).toBeTruthy();
    expect(
      screen.getByText('Neleri beğenmediğinizi, önerilerinizi ve yaşadığınız sorunları bizimle paylaşabilirsiniz.'),
    ).toBeTruthy();
    expect(messageInput().props.placeholder).toBe('Geri bildiriminizi buraya yazın...');
    expect(screen.getByTestId('feedback-keyboard-aware-scroll')).toBeTruthy();
    expect(submitButton()).toBeTruthy();
  });

  it('keeps submit disabled until something other than whitespace is typed', () => {
    renderWithTamagui(<FeedbackScreen />);

    fireEvent.press(submitButton());
    fireEvent.changeText(messageInput(), '    ');
    fireEvent.press(submitButton());

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('sends the trimmed message, clears the field and shows the thank-you dialog', async () => {
    mockSend.mockResolvedValue(undefined);
    renderWithTamagui(<FeedbackScreen />);

    fireEvent.changeText(messageInput(), '  Kargo çok hızlıydı.  ');
    fireEvent.press(submitButton());

    await waitFor(() => expect(mockSend).toHaveBeenCalledWith({ message: 'Kargo çok hızlıydı.' }));
    expect(await screen.findByText('Geri bildiriminiz başarıyla gönderildi. Teşekkür ederiz!')).toBeTruthy();
    expect(messageInput().props.value).toBe('');
  });

  it('normalises decorative unicode letters like the web input', async () => {
    mockSend.mockResolvedValue(undefined);
    renderWithTamagui(<FeedbackScreen />);

    fireEvent.changeText(messageInput(), '𝐆𝐮𝐥 ʜᴀʏᴅɪɢɪʏ');
    expect(messageInput().props.value).toBe('Gul haydigiy');
  });

  it('shows the fallback error for a missing route and the backend message for validation errors', async () => {
    mockSend.mockRejectedValueOnce(axiosError(404, { message: 'The route api/feedback could not be found.' }));
    renderWithTamagui(<FeedbackScreen />);

    fireEvent.changeText(messageInput(), 'Merhaba');
    fireEvent.press(submitButton());

    expect(
      await screen.findByText('Geri bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'),
    ).toBeTruthy();
    expect(messageInput().props.value).toBe('Merhaba');

    mockSend.mockRejectedValueOnce(axiosError(422, { message: 'Mesaj çok uzun.' }));
    fireEvent.press(submitButton());
    expect(await screen.findByText('Mesaj çok uzun.')).toBeTruthy();
  });

  it('asks guests to sign in', () => {
    mockAuthStatus.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderWithTamagui(<FeedbackScreen />);

    fireEvent.press(screen.getByText('Giriş Yap'));
    expect(mockReplace).toHaveBeenCalledWith('/profile');
  });
});
