import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { StarRatingInput } from './star-rating-input';

describe('StarRatingInput', () => {
  it.each(['light', 'dark'] as const)('renders one 48dp radio per star and reports the pick in %s theme', (theme) => {
    const onChange = jest.fn();
    renderWithTamagui(
      <StarRatingInput accessibilityLabel="Puan" getStarLabel={(value, max) => `${max} üzerinden ${value} puan`} max={4} onChange={onChange} value={2} />,
      theme,
    );

    expect(screen.getAllByLabelText(/üzerinden/)).toHaveLength(4);
    expect(screen.getByLabelText('4 üzerinden 2 puan').props.accessibilityState).toEqual({ checked: true, disabled: false });
    fireEvent.press(screen.getByLabelText('4 üzerinden 3 puan'));
    expect(onChange).toHaveBeenCalledWith(3);
  });
});
