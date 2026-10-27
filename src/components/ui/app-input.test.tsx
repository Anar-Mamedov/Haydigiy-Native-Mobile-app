import { Platform, StyleSheet } from 'react-native';
import { screen } from '@testing-library/react-native';
import { AppInput } from './app-input';
import { PasswordVisibilityToggle } from './password-visibility-toggle';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('AppInput', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('renders the visible label by default', () => {
    renderWithTamagui(<AppInput label="CVV" onChangeText={jest.fn()} value="" />);

    expect(screen.getByText('CVV')).toBeTruthy();
    expect(screen.getByLabelText('CVV')).toBeTruthy();
  });

  it('can hide the visible label while keeping the input accessible', () => {
    renderWithTamagui(<AppInput hideVisibleLabel label="CVV" onChangeText={jest.fn()} value="" />);

    expect(screen.queryByText('CVV')).toBeNull();
    expect(screen.getByLabelText('CVV')).toBeTruthy();
  });

  it('keeps its label and touch target in dark theme', () => {
    renderWithTamagui(<AppInput label="Şifre" onChangeText={jest.fn()} value="" />, 'dark');

    expect(screen.getByLabelText('Şifre')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByLabelText('Şifre').props.style)).toMatchObject({ minHeight: 48 });
  });

  describe('on Android', () => {
    beforeEach(() => {
      Platform.OS = 'android';
    });

    it('names the field through its visible label instead of a contentDescription', () => {
      // Regresyon: Play "Düzenlenebilir öğe etiketi" — EditText'e verilen accessibilityLabel
      // contentDescription olur ve TalkBack yazılan metin yerine onu okuyabilir.
      renderWithTamagui(
        <AppInput id="login-identifier" label="E-posta" onChangeText={jest.fn()} testID="identifier" value="" />,
      );

      const input = screen.getByTestId('identifier');
      expect(input.props.accessibilityLabel).toBeUndefined();
      expect(input.props.accessibilityLabelledBy).toBe('login-identifier-label');
      // React Native `Text`, `id`'yi native tarafta `nativeID` olarak yayınlar; labeledBy bunu bulur.
      expect(screen.getByText('E-posta').props.id).toBe('login-identifier-label');
    });

    it('lets the placeholder name a field whose visible label is hidden', () => {
      renderWithTamagui(
        <AppInput hideVisibleLabel label="Kupon kodu" onChangeText={jest.fn()} placeholder="Kupon Kodu" value="" />,
      );

      const input = screen.getByPlaceholderText('Kupon Kodu');
      expect(input.props.accessibilityLabel).toBeUndefined();
      expect(input.props.accessibilityLabelledBy).toBeUndefined();
    });

    it('keeps an accessibilityLabel when neither a visible label nor a placeholder exists', () => {
      renderWithTamagui(<AppInput hideVisibleLabel label="Kupon kodu" onChangeText={jest.fn()} value="" />);

      expect(screen.getByLabelText('Kupon kodu').props.accessibilityLabel).toBe('Kupon kodu');
    });
  });

  it('never lets a screen shrink the field below the 48dp touch target', () => {
    // Regresyon: 44dp alanlar Play "Dokunma hedefi boyutu" uyarısı veriyordu.
    renderWithTamagui(<AppInput height={40} hideVisibleLabel label="Ara" onChangeText={jest.fn()} value="" />);

    expect(StyleSheet.flatten(screen.getByLabelText('Ara').props.style)).toMatchObject({ height: 40, minHeight: 48 });
  });

  it('keeps the pressable label row at the 48dp touch target', () => {
    renderWithTamagui(<AppInput label="Şifre" onChangeText={jest.fn()} value="" />);

    expect(StyleSheet.flatten(screen.getByText('Şifre').props.style)).toMatchObject({ lineHeight: 48 });
  });

  it('reserves room for a 48dp right element so typed text stays clear of it', () => {
    renderWithTamagui(
      <AppInput
        label="Şifre"
        onChangeText={jest.fn()}
        rightElement={<PasswordVisibilityToggle onToggle={jest.fn()} visible={false} />}
        value=""
      />,
    );

    expect(StyleSheet.flatten(screen.getByLabelText('Şifre').props.style)).toMatchObject({ paddingRight: 52 });
    expect(StyleSheet.flatten(screen.getByLabelText('Şifreyi göster').props.style)).toMatchObject({
      minHeight: 48,
      minWidth: 48,
    });
  });
});
