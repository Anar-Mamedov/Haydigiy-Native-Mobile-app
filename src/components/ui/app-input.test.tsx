import { screen } from '@testing-library/react-native';
import { AppInput } from './app-input';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('AppInput', () => {
  it('renders the visible label by default', () => {
    renderWithTamagui(<AppInput label="CVV" onChangeText={jest.fn()} value="" />);

    expect(screen.getByText('CVV')).toBeTruthy();
    expect(screen.getByLabelText('CVV')).toBeTruthy();
  });

  it('can hide the visible label while keeping the input accessible', () => {
    renderWithTamagui(<AppInput hideVisibleLabel label="CVV" onChangeText={jest.fn()} value="" />);

    expect(screen.queryByText('CVV')).toBeNull();
    expect(screen.getByLabelText('CVV')).toBeTruthy();
  });
});
