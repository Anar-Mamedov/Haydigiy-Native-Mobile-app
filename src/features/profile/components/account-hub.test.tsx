import { Alert } from 'react-native';
import { screen, fireEvent } from '@testing-library/react-native';
import { AccountHub } from './account-hub';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('AccountHub', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the account sections', () => {
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    expect(screen.getByText('Tüm Siparişlerim')).toBeTruthy();
    expect(screen.getByText('Favorilerim')).toBeTruthy();
    expect(screen.getByText('Hesabım')).toBeTruthy();
    expect(screen.getByText('Bize Ulaşın')).toBeTruthy();
    expect(screen.getByText('Görünüm')).toBeTruthy();
    expect(screen.getByText('Çıkış Yap')).toBeTruthy();
  });

  it('navigates to favorites when the Favorilerim row is pressed', () => {
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Favorilerim'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/favorites');
  });

  it('navigates to the coupons screen when İndirim Kuponlarım is pressed', () => {
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('İndirim Kuponlarım'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/coupons');
  });

  it('navigates to the reviews screen when Ürün Değerlendirme is pressed', () => {
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Ürün Değerlendirme'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/reviews');
  });

  it('shows a "coming soon" alert for sections without a mobile screen yet', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Kullanıcı Bilgilerim'));
    expect(alertSpy).toHaveBeenCalledWith('Yakında', expect.any(String));
    alertSpy.mockRestore();
  });

  it('calls onLogout when Çıkış Yap is pressed', () => {
    const onLogout = jest.fn();
    renderWithTamagui(<AccountHub onLogout={onLogout} />);

    fireEvent.press(screen.getByText('Çıkış Yap'));
    expect(onLogout).toHaveBeenCalled();
  });
});
