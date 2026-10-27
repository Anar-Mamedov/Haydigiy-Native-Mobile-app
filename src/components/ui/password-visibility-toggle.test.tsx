import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { PasswordVisibilityToggle } from './password-visibility-toggle';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('PasswordVisibilityToggle', () => {
  it('calls onToggle when pressed', () => {
    const handleToggle = jest.fn();

    renderWithTamagui(<PasswordVisibilityToggle onToggle={handleToggle} visible={false} />);

    fireEvent.press(screen.getByLabelText('Şifreyi göster'));

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('updates its accessible label for the visible state', () => {
    renderWithTamagui(<PasswordVisibilityToggle onToggle={jest.fn()} visible />);

    expect(screen.getByLabelText('Şifreyi gizle')).toBeTruthy();
  });

  it('keeps its interactive label available in dark theme', () => {
    renderWithTamagui(<PasswordVisibilityToggle onToggle={jest.fn()} visible={false} />, 'dark');

    expect(screen.getByLabelText('Şifreyi göster')).toBeTruthy();
  });

  it('keeps a 48dp touch area around the eye icon', () => {
    // Regresyon: 44x44 Tamagui butonu Play "Dokunma hedefi boyutu" uyarısı veriyordu.
    renderWithTamagui(<PasswordVisibilityToggle onToggle={jest.fn()} visible={false} />);

    expect(StyleSheet.flatten(screen.getByLabelText('Şifreyi göster').props.style)).toMatchObject({
      minHeight: 48,
      minWidth: 48,
    });
  });
});
