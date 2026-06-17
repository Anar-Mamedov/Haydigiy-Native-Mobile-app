import { screen, fireEvent } from '@testing-library/react-native';
import { Theme } from 'tamagui';
import { QuantityStepper } from './quantity-stepper';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('QuantityStepper', () => {
  it('increments and decrements through its callback', () => {
    const onChange = jest.fn();
    renderWithTamagui(
      <QuantityStepper accessibilityLabel="Ürün" value={2} onChange={onChange} />
    );

    fireEvent.press(screen.getByLabelText('Ürün artır'));
    expect(onChange).toHaveBeenCalledWith(3);

    fireEvent.press(screen.getByLabelText('Ürün azalt'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('disables decrement at the minimum and increment at the maximum', () => {
    const onChange = jest.fn();
    renderWithTamagui(
      <QuantityStepper accessibilityLabel="Ürün" max={3} min={1} value={1} onChange={onChange} />
    );

    fireEvent.press(screen.getByLabelText('Ürün azalt'));
    expect(onChange).not.toHaveBeenCalled();

    screen.rerender(
      <QuantityStepper accessibilityLabel="Ürün" max={3} min={1} value={3} onChange={onChange} />
    );
    fireEvent.press(screen.getByLabelText('Ürün artır'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the value visible and controls present in dark theme', () => {
    renderWithTamagui(
      <Theme name="dark">
        <QuantityStepper accessibilityLabel="Ürün" value={5} onChange={jest.fn()} />
      </Theme>
    );

    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByLabelText('Ürün artır')).toBeTruthy();
    expect(screen.getByLabelText('Ürün azalt')).toBeTruthy();
  });
});
