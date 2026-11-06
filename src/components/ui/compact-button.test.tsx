import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { CompactButton } from './compact-button';

function renderButton(props: Partial<React.ComponentProps<typeof CompactButton>> = {}, theme?: 'dark') {
  const onPress = jest.fn();
  renderWithTamagui(
    <CompactButton
      backgroundColor="$brand"
      color="white"
      label="Doğrula"
      onPress={onPress}
      testID="compact"
      {...props}
    />,
    theme,
  );
  return { onPress };
}

describe('CompactButton', () => {
  it('fires onPress and exposes a button role with its label', () => {
    const { onPress } = renderButton({ accessibilityLabel: 'E-posta adresini doğrula' });

    const button = screen.getByRole('button', { name: 'E-posta adresini doğrula' });
    fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Doğrula')).toBeTruthy();
  });

  it('keeps a 48dp touch target around the smaller body', () => {
    renderButton();

    const pressable = screen.getByTestId('compact');
    const style = StyleSheet.flatten(
      typeof pressable.props.style === 'function'
        ? pressable.props.style({ pressed: false })
        : pressable.props.style,
    );
    expect(style.minHeight).toBe(MIN_TOUCH_TARGET);
    expect(style.minWidth).toBe(MIN_TOUCH_TARGET);
  });

  it('ignores presses and reports busy while busy', () => {
    const { onPress } = renderButton({ busy: true, label: 'Gönderiliyor...' });

    const button = screen.getByRole('button');
    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ busy: true, disabled: true }));
    expect(screen.getByText('Gönderiliyor...')).toBeTruthy();
  });

  it('stays readable in dark mode', () => {
    renderButton({}, 'dark');

    expect(screen.getByText('Doğrula')).toBeTruthy();
  });
});
