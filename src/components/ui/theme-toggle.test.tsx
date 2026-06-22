import { fireEvent, screen } from '@testing-library/react-native';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('ThemeToggle', () => {
  it('renders all theme labels', () => {
    renderWithTamagui(<ThemeToggle onValueChange={jest.fn()} value="system" />);

    expect(screen.getByText('Sistem')).toBeTruthy();
    expect(screen.getByText('Aydınlık')).toBeTruthy();
    expect(screen.getByText('Koyu')).toBeTruthy();
  });

  it('calls onValueChange with the selected theme option', () => {
    const handleChange = jest.fn();

    renderWithTamagui(<ThemeToggle onValueChange={handleChange} value="system" />);

    fireEvent.press(screen.getByLabelText('Koyu temasını seç'));

    expect(handleChange).toHaveBeenCalledWith('dark');
  });

  it('keeps every segment label visible in dark theme', () => {
    // Theme-aware reusable control: labels/icons must stay rendered after a theme
    // change so the active segment never collapses or becomes unreadable.
    renderWithTamagui(<ThemeToggle onValueChange={jest.fn()} value="dark" />, 'dark');

    expect(screen.getByText('Sistem')).toBeTruthy();
    expect(screen.getByText('Aydınlık')).toBeTruthy();
    expect(screen.getByText('Koyu')).toBeTruthy();
    expect(screen.getByLabelText('Koyu temasını seç').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });
});
