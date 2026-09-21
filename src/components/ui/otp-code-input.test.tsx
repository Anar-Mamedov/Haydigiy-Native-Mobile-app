import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OtpCodeInput } from './otp-code-input';

describe('OtpCodeInput', () => {
  it('keeps only digits and stops at the configured length', () => {
    const onChangeText = jest.fn();
    renderWithTamagui(
      <OtpCodeInput
        accessibilityLabel="6 haneli doğrulama kodu"
        onChangeText={onChangeText}
        testID="otp-code-input"
        value=""
      />,
    );

    fireEvent.changeText(screen.getByTestId('otp-code-input'), '1a2b3c4d5e6f7g');

    expect(onChangeText).toHaveBeenCalledWith('123456');
  });

  it('renders one box per digit and exposes both accessible names', () => {
    renderWithTamagui(
      <OtpCodeInput
        accessibilityLabel="4 haneli doğrulama kodu"
        focusAccessibilityLabel="Doğrulama kodunu gir"
        length={4}
        onChangeText={jest.fn()}
        value="12"
      />,
    );

    expect(screen.getByLabelText('Doğrulama kodunu gir')).toBeTruthy();
    expect(screen.getByLabelText('4 haneli doğrulama kodu')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('keeps the decorative boxes out of the accessibility tree by default', () => {
    // Without an explicit focus label the hidden field is the only control a
    // screen reader should see — the boxes would otherwise duplicate its name.
    renderWithTamagui(
      <OtpCodeInput
        accessibilityLabel="6 haneli doğrulama kodu"
        onChangeText={jest.fn()}
        testID="otp-code-input"
        value="7"
      />,
    );

    expect(screen.getAllByLabelText('6 haneli doğrulama kodu')).toHaveLength(1);
    expect(screen.getByTestId('otp-code-input').props.value).toBe('7');
    expect(screen.getByText('7', { includeHiddenElements: true })).toBeTruthy();
  });

  it('stays readable in dark mode', () => {
    renderWithTamagui(
      <OtpCodeInput
        accessibilityLabel="6 haneli doğrulama kodu"
        focusAccessibilityLabel="Doğrulama kodunu gir"
        onChangeText={jest.fn()}
        value="7"
      />,
      'dark',
    );

    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByLabelText('Doğrulama kodunu gir')).toBeTruthy();
  });

  it('blocks entry while disabled', () => {
    renderWithTamagui(
      <OtpCodeInput
        accessibilityLabel="6 haneli doğrulama kodu"
        disabled
        onChangeText={jest.fn()}
        testID="otp-code-input"
        value=""
      />,
    );

    expect(screen.getByTestId('otp-code-input').props.editable).toBe(false);
  });
});
