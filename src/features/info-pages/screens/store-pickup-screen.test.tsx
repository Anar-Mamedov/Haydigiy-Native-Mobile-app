import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { StorePickupScreen } from './store-pickup-screen';

const mockDismissTo = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    canGoBack: mockCanGoBack,
    dismissTo: mockDismissTo,
    replace: mockReplace,
  }),
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

describe('StorePickupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['light', 'dark'] as const)('renders the hero, steps and benefits in the %s theme', (theme) => {
    renderWithTamagui(<StorePickupScreen />, theme);

    // Başlık çubuğu + "Nasıl çalışır?" bölümünün üst etiketi.
    expect(screen.getAllByText('Mağazadan Al')).toHaveLength(2);
    expect(screen.getByText('Niğde’deysen kargo ücreti ödeme!')).toBeTruthy();
    expect(screen.getByText('Nasıl çalışır?')).toBeTruthy();
    expect(screen.getByText('Siparişini oluştur')).toBeTruthy();
    expect(screen.getByText('Mağazadan teslim al')).toBeTruthy();
    expect(screen.getByText('01')).toBeTruthy();
    expect(screen.getByText('04')).toBeTruthy();
    expect(screen.getByText('Kargo ücreti yok')).toBeTruthy();
    expect(screen.getByLabelText('Alışverişe Başla')).toBeTruthy();
  });

  it('returns to the home tab when the shopper starts shopping', () => {
    renderWithTamagui(<StorePickupScreen />);

    fireEvent.press(screen.getByLabelText('Alışverişe Başla'));

    expect(mockDismissTo).toHaveBeenCalledWith('/');
  });
});
