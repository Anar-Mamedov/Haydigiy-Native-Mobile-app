import { ScrollView } from 'react-native';
import { screen } from '@testing-library/react-native';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppScreen } from '@/components/ui/app-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

describe('AppScreen', () => {
  it('lets the first tap reach buttons while the keyboard is open', () => {
    // Regresyon: varsayılan 'never' ilk dokunuşu yutup yalnızca klavyeyi kapatıyordu; OTP
    // "Doğrula ve Devam Et" ikinci basışta çalışıyordu.
    renderWithTamagui(
      <AppScreen>
        <Paragraph>İçerik</Paragraph>
      </AppScreen>,
    );

    expect(screen.UNSAFE_getByType(ScrollView).props.keyboardShouldPersistTaps).toBe('handled');
    expect(screen.getByText('İçerik')).toBeTruthy();
  });

  it('renders without a ScrollView when not scrollable', () => {
    renderWithTamagui(
      <AppScreen scrollable={false}>
        <Paragraph>İçerik</Paragraph>
      </AppScreen>,
    );

    expect(screen.UNSAFE_queryByType(ScrollView)).toBeNull();
    expect(screen.getByText('İçerik')).toBeTruthy();
  });
});
