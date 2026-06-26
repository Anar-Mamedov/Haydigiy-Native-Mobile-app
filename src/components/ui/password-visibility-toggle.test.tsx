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
});
