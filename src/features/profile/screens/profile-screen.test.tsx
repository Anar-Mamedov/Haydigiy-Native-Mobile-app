import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react-native';
import { ProfileScreen } from './profile-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useAuthStore } from '../../auth/store/use-auth-store';
import { useAuthStatus } from '../../auth/hooks/use-auth-status';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    canGoBack: mockCanGoBack,
  }),
  useFocusEffect: (cb: any) => cb(),
}));

jest.mock('../../auth/hooks/use-auth-status', () => ({
  useAuthStatus: jest.fn(),
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isLoading: false,
    });
  });

  it('renders loading state when auth status is checking', () => {
    (useAuthStatus as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderWithTamagui(<ProfileScreen />);
    expect(screen.getByText('Kullanıcı bilgisi kontrol ediliyor...')).toBeTruthy();
  });

  it('renders authenticated user profile view correctly', () => {
    (useAuthStatus as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    useAuthStore.setState({
      user: {
        id: 'user-123',
        name: 'Anar',
        surname: 'Mamedov',
        email: 'anar@example.com',
        phoneNumber: '5551234567',
      },
    });

    renderWithTamagui(<ProfileScreen />);

    // Name is shown in the account header; account hub sections + actions below.
    expect(screen.getByText('Anar Mamedov')).toBeTruthy();
    expect(screen.queryByText('Görünüm')).toBeNull();
    expect(screen.getByText('Çıkış Yap')).toBeTruthy();
  });

  it('navigates to the user info screen when the account header is pressed', () => {
    (useAuthStatus as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    useAuthStore.setState({
      user: {
        id: 'user-123',
        name: 'Anar',
        surname: 'Mamedov',
        email: 'anar@example.com',
        phoneNumber: '5551234567',
      },
    });

    renderWithTamagui(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText('Anar Mamedov'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/user-info');
  });

  it('calls logout when Çıkış Yap button is pressed', async () => {
    (useAuthStatus as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    useAuthStore.setState({
      user: {
        id: 'user-123',
        name: 'Anar',
        email: 'anar@example.com',
      },
    });

    const logoutMock = jest.spyOn(useAuthStore.getState(), 'logout');

    renderWithTamagui(<ProfileScreen />);
    
    const logoutBtn = screen.getByText('Çıkış Yap');
    await act(async () => {
      fireEvent.press(logoutBtn);
    });

    expect(logoutMock).toHaveBeenCalled();
  });

  it('renders guest authentication tabs when unauthenticated', () => {
    (useAuthStatus as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithTamagui(<ProfileScreen />);

    expect(screen.getAllByText('Giriş Yap').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Üye Ol').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('E-posta veya telefon (5xxxxxxxxx)')).toBeTruthy();
    expect(screen.getByPlaceholderText('Şifrenizi girin')).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    (useAuthStatus as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithTamagui(<ProfileScreen />);
    
    // Find back button by accessibility label
    const backBtn = screen.getByLabelText('Geri Dön');
    fireEvent.press(backBtn);

    expect(mockBack).toHaveBeenCalled();
  });
});
