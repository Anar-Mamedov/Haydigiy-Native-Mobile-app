import { Keyboard } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { AppSelect } from './app-select';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const OPTIONS = [
  { label: 'Ay', value: '01' },
  { label: 'Yil', value: '26' },
];

describe('AppSelect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('dismisses the keyboard before opening the options sheet', () => {
    renderWithTamagui(
      <AppSelect
        label="Son Kullanma Ayi"
        onValueChange={jest.fn()}
        options={OPTIONS}
        placeholder="Ay"
      />,
    );

    fireEvent.press(screen.getByLabelText('Son Kullanma Ayi'));

    expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
  });

  it('does not dismiss the keyboard when the select is disabled', () => {
    renderWithTamagui(
      <AppSelect
        disabled
        label="Son Kullanma Ayi"
        onValueChange={jest.fn()}
        options={OPTIONS}
        placeholder="Ay"
      />,
    );

    fireEvent.press(screen.getByLabelText('Son Kullanma Ayi'));

    expect(Keyboard.dismiss).not.toHaveBeenCalled();
  });
});
