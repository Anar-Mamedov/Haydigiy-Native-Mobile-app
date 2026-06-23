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

  it('navigates to the user info screen when Kullanıcı Bilgilerim is pressed', () => {
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Kullanıcı Bilgilerim'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/user-info');
  });

  it('navigates to the change password screen when Şifre Değişikliği is pressed', () => {
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Şifre Değişikliği'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/change-password');
  });

  it('navigates to the addresses screen when Adres Bilgilerim is pressed', () => {
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Adres Bilgilerim'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/addresses');
  });

  it('navigates to the payment methods screen when Ödeme Bilgilerim is pressed', () => {
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Ödeme Bilgilerim'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/payment-methods');
  });

  it('navigates to the bank account screen when Banka Hesabımız is pressed', () => {
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Banka Hesabımız'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/bank-account');
  });

  it('navigates to the agreements screen when Sözleşmeler is pressed', () => {
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Sözleşmeler'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/agreements');
  });

  it('navigates to the help screen when Yardım & Sıkça Sorulan Sorular is pressed', () => {
    renderWithTamagui(<AccountHub onLogout={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Yardım & Sıkça Sorulan Sorular'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/help');
  });

  it('calls onLogout when Çıkış Yap is pressed', () => {
    const onLogout = jest.fn();
    renderWithTamagui(<AccountHub onLogout={onLogout} />);

    fireEvent.press(screen.getByText('Çıkış Yap'));
    expect(onLogout).toHaveBeenCalled();
  });
});
