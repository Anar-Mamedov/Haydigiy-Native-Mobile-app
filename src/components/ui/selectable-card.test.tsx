import { fireEvent, screen } from '@testing-library/react-native';
import { SelectableCard } from '@/components/ui/selectable-card';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('SelectableCard', () => {
  it('renders the title and description', () => {
    renderWithTamagui(
      <SelectableCard
        description="İade kodunuzla gönderin."
        onPress={jest.fn()}
        selected={false}
        title="PTT Kargo"
      />,
    );

    expect(screen.getByText('PTT Kargo')).toBeTruthy();
    expect(screen.getByText('İade kodunuzla gönderin.')).toBeTruthy();
  });

  it('exposes the selected state to accessibility services', () => {
    renderWithTamagui(<SelectableCard onPress={jest.fn()} selected title="Hediye Çeki" />);

    expect(screen.getByLabelText('Hediye Çeki').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    renderWithTamagui(<SelectableCard onPress={onPress} selected={false} title="IBAN" />);

    fireEvent.press(screen.getByLabelText('IBAN'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores presses and marks itself disabled while disabled', () => {
    const onPress = jest.fn();
    renderWithTamagui(<SelectableCard disabled onPress={onPress} selected={false} title="IBAN" />);

    fireEvent.press(screen.getByLabelText('IBAN'));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByLabelText('IBAN').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it('keeps its title and description visible in the dark theme', () => {
    renderWithTamagui(
      <SelectableCard
        description="Kupon tanımlanır."
        onPress={jest.fn()}
        selected
        title="Hediye Çeki"
      />,
      'dark',
    );

    expect(screen.getByText('Hediye Çeki')).toBeTruthy();
    expect(screen.getByText('Kupon tanımlanır.')).toBeTruthy();
  });
});
