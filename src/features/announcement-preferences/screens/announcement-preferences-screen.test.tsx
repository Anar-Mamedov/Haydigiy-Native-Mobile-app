import { Alert } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import {
  getAnnouncementPreferencesDto,
  updateAnnouncementPreferencesDto,
} from '@/services/announcement-preferences.service';
import { AnnouncementPreferencesScreen } from './announcement-preferences-screen';

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

jest.mock('@/services/announcement-preferences.service', () => ({
  getAnnouncementPreferencesDto: jest.fn(),
  updateAnnouncementPreferencesDto: jest.fn(),
}));

const mockAuthStatus = useAuthStatus as jest.Mock;
const mockGet = getAnnouncementPreferencesDto as jest.Mock;
const mockUpdate = updateAnnouncementPreferencesDto as jest.Mock;

const switchState = (label: string) => screen.getByLabelText(label).props.accessibilityState?.checked;

describe('AnnouncementPreferencesScreen', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockAuthStatus.mockReturnValue({ isAuthenticated: true, isLoading: false });
    useAuthStore.setState({ isLoading: false, user: { id: '8', email: 'a@example.com', name: 'Anar' } });
    mockGet.mockResolvedValue({ notify_email: true, notify_sms: false, notify_call: false });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it.each(['light', 'dark'] as const)('shows the saved preferences in %s theme', async (theme) => {
    renderWithTamagui(<AnnouncementPreferencesScreen />, theme);

    expect(await screen.findByText('E-mail')).toBeTruthy();
    expect(screen.getByText('Duyuru Tercihlerim')).toBeTruthy();
    expect(
      screen.getByText('İlgimi çekebilecek kampanyalarla ve butik bültenleriyle ilgili e-posta almak istiyorum.'),
    ).toBeTruthy();
    expect(switchState('E-mail')).toBe(true);
    expect(switchState('SMS')).toBe(false);
    expect(switchState('Telefon Görüşmesi')).toBe(false);
    expect(screen.getByText('Güncelle')).toBeTruthy();
  });

  it('saves the edited preferences only when Güncelle is pressed', async () => {
    mockUpdate.mockResolvedValue({ data: { notify_email: true, notify_sms: true, notify_call: false } });
    renderWithTamagui(<AnnouncementPreferencesScreen />);
    await screen.findByText('E-mail');

    fireEvent.press(screen.getByLabelText('SMS'));
    expect(switchState('SMS')).toBe(true);
    expect(mockUpdate).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Güncelle'));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({ notify_email: true, notify_sms: true, notify_call: false }),
    );
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Başarılı', 'Tercihleriniz başarıyla kaydedildi.'));
    expect(switchState('SMS')).toBe(true);
  });

  it('keeps the edited values and shows the web error when saving fails', async () => {
    mockUpdate.mockRejectedValue(new Error('network'));
    renderWithTamagui(<AnnouncementPreferencesScreen />);
    await screen.findByText('E-mail');

    fireEvent.press(screen.getByLabelText('E-mail'));
    fireEvent.press(screen.getByText('Güncelle'));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.'));
    expect(switchState('E-mail')).toBe(false);
  });

  it('shows a retryable error instead of default values when loading fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('network'));
    renderWithTamagui(<AnnouncementPreferencesScreen />);

    expect(await screen.findByText('Bir Hata Oluştu')).toBeTruthy();
    expect(screen.queryByText('Güncelle')).toBeNull();

    fireEvent.press(screen.getByText('Tekrar Dene'));
    expect(await screen.findByText('E-mail')).toBeTruthy();
  });

  it('asks guests to sign in', () => {
    mockAuthStatus.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderWithTamagui(<AnnouncementPreferencesScreen />);

    fireEvent.press(screen.getByText('Giriş Yap'));
    expect(mockReplace).toHaveBeenCalledWith('/profile');
    expect(mockGet).not.toHaveBeenCalled();
  });
});
