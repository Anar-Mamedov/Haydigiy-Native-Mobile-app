import { fireEvent, screen } from '@testing-library/react-native';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const OPTIONS = [
  { label: 'Bireysel', value: 'individual' },
  { label: 'Kurumsal', value: 'corporate' },
];

describe('SegmentedControl', () => {
  it('renders every segment label', () => {
    renderWithTamagui(
      <SegmentedControl onChange={jest.fn()} options={OPTIONS} value="individual" />,
    );

    expect(screen.getByText('Bireysel')).toBeTruthy();
    expect(screen.getByText('Kurumsal')).toBeTruthy();
  });

  it('marks the active segment as selected', () => {
    renderWithTamagui(
      <SegmentedControl onChange={jest.fn()} options={OPTIONS} value="individual" />,
    );

    expect(screen.getByLabelText('Bireysel').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(screen.getByLabelText('Kurumsal').props.accessibilityState).toMatchObject({
      selected: false,
    });
  });

  it('calls onChange with the pressed segment value', () => {
    const handleChange = jest.fn();
    renderWithTamagui(
      <SegmentedControl onChange={handleChange} options={OPTIONS} value="individual" />,
    );

    fireEvent.press(screen.getByLabelText('Kurumsal'));

    expect(handleChange).toHaveBeenCalledWith('corporate');
  });

  it('does not call onChange while disabled', () => {
    const handleChange = jest.fn();
    renderWithTamagui(
      <SegmentedControl disabled onChange={handleChange} options={OPTIONS} value="individual" />,
    );

    fireEvent.press(screen.getByLabelText('Kurumsal'));

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('keeps every segment label visible and selection correct in dark theme', () => {
    // Theme-aware reusable control: labels must stay rendered and the active
    // segment must remain marked after a theme change.
    renderWithTamagui(
      <SegmentedControl onChange={jest.fn()} options={OPTIONS} value="corporate" />,
      'dark',
    );

    expect(screen.getByText('Bireysel')).toBeTruthy();
    expect(screen.getByText('Kurumsal')).toBeTruthy();
    expect(screen.getByLabelText('Kurumsal').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });
});
