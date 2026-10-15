import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductFeedbackButton } from './product-feedback-button';

describe('ProductFeedbackButton', () => {
  it.each(['light', 'dark'] as const)('is a 48dp button that opens feedback (%s)', (theme) => {
    // Regresyon: rolsüz, ~42dp yüksekliğinde bir Pressable idi.
    const onPress = jest.fn();
    renderWithTamagui(<ProductFeedbackButton onPress={onPress} />, theme);

    const button = screen.getByRole('button', { name: /Geri Bildirim Ver/ });
    expect(screen.getByText('Geri Bildirim Ver')).toBeTruthy();

    let box = screen.getByText('Geri Bildirim Ver').parent;
    while (box && StyleSheet.flatten(box.props?.style)?.minHeight === undefined) {
      box = box.parent;
    }
    expect(StyleSheet.flatten(box?.props.style)).toMatchObject({ minHeight: 48 });

    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
