import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { AppRadioGroup } from './app-radio-group';

const OPTIONS = [
  { value: 'phone', label: 'Telefon' },
  { value: 'computer', label: 'Bilgisayar', description: 'Masaüstü veya dizüstü' },
];

describe('AppRadioGroup', () => {
  it.each(['light', 'dark'] as const)('exposes radio roles and the checked state in %s theme', (theme) => {
    const onChange = jest.fn();
    renderWithTamagui(<AppRadioGroup accessibilityLabel="Cihaz" onChange={onChange} options={OPTIONS} value="phone" />, theme);

    expect(screen.getByLabelText('Cihaz')).toBeTruthy();
    expect(screen.getByLabelText('Telefon').props.accessibilityState).toEqual({ checked: true, disabled: false });
    expect(screen.getByText('Masaüstü veya dizüstü')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Bilgisayar, Masaüstü veya dizüstü'));
    expect(onChange).toHaveBeenCalledWith('computer');
  });

  it('renders accordion content only under the selected option and ignores presses while disabled', () => {
    const onChange = jest.fn();
    renderWithTamagui(
      <AppRadioGroup
        accessibilityLabel="Başlık"
        disabled
        onChange={onChange}
        options={OPTIONS}
        renderSelectedContent={(option) => <Text>{`içerik:${option.value}`}</Text>}
        value="computer"
      />,
    );

    expect(screen.getByText('içerik:computer')).toBeTruthy();
    expect(screen.queryByText('içerik:phone')).toBeNull();
    fireEvent.press(screen.getByLabelText('Telefon'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
