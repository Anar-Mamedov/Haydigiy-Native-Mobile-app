import { fireEvent, screen } from '@testing-library/react-native';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('ThemeToggle', () => {
  it('renders all theme labels', () => {
    renderWithTamagui(<ThemeToggle onValueChange={jest.fn()} value="system" />);

    expect(screen.getByText('System')).toBeTruthy();
    expect(screen.getByText('Light')).toBeTruthy();
    expect(screen.getByText('Dark')).toBeTruthy();
  });

  it('calls onValueChange with the selected theme option', () => {
    const handleChange = jest.fn();

    renderWithTamagui(<ThemeToggle onValueChange={handleChange} value="system" />);

    fireEvent.press(screen.getByLabelText('Activate Dark theme'));

    expect(handleChange).toHaveBeenCalledWith('dark');
  });
});
