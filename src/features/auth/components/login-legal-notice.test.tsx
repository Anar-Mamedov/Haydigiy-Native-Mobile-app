import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { LoginLegalNotice } from './login-legal-notice';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('LoginLegalNotice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['light', 'dark'] as const)('renders the three legal texts as links in the %s theme', (theme) => {
    renderWithTamagui(<LoginLegalNotice />, theme);

    expect(screen.getByRole('link', { name: 'Aydınlatma Metni' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Üyelik Sözleşmesi' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Gizlilik Politikası' })).toBeTruthy();
  });

  it.each([
    ['Aydınlatma Metni', '/bilgi/aydinlatma-metni'],
    ['Üyelik Sözleşmesi', '/bilgi/uyelik-sozlesmesi'],
    ['Gizlilik Politikası', '/bilgi/kisisel-verilerin-korunmasi'],
  ])('opens %s on its info page', (label, route) => {
    renderWithTamagui(<LoginLegalNotice />);

    fireEvent.press(screen.getByRole('link', { name: label }));

    expect(mockPush).toHaveBeenCalledWith(route);
  });
});
