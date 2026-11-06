import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { HomeFooter } from './home-footer';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('HomeFooter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['light', 'dark'] as const)(
    'lists the corporate and legal pages linked from the web footer in the %s theme',
    (theme) => {
      renderWithTamagui(<HomeFooter />, theme);

      expect(screen.getByText('Kurumsal')).toBeTruthy();
      [
        'Hakkımızda',
        'İşlem Rehberi',
        'Mağazadan Al',
        'İptal ve İade Koşulları',
        'Üyelik Sözleşmesi',
        'Kullanım Koşulları',
        'Kişisel Verilerin Korunması',
        'Çerez Politikası',
      ].forEach((label) => {
        expect(screen.getByRole('link', { name: label })).toBeTruthy();
      });
    },
  );

  it('opens with the advantages band of the web footer', () => {
    renderWithTamagui(<HomeFooter />);

    expect(screen.getByTestId('store-advantages-band')).toBeTruthy();
    expect(screen.getByText('24 Saatte Kargoda')).toBeTruthy();
    expect(screen.getByText('%100 Güvenli Ödeme Sayfası')).toBeTruthy();
  });

  it('opens the info page of a footer link', () => {
    renderWithTamagui(<HomeFooter />);

    fireEvent.press(screen.getByRole('link', { name: 'Üyelik Sözleşmesi' }));

    expect(mockPush).toHaveBeenCalledWith('/bilgi/uyelik-sozlesmesi');
  });
});
