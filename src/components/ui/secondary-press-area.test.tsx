import { fireEvent, screen } from '@testing-library/react-native';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SecondaryPressArea } from '@/components/ui/secondary-press-area';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('SecondaryPressArea', () => {
  it('handles a finger press on its content', () => {
    const onPress = jest.fn();
    renderWithTamagui(
      <SecondaryPressArea onPress={onPress} testID="alan">
        <Paragraph>Fiyat</Paragraph>
      </SecondaryPressArea>,
    );

    fireEvent.press(screen.getByText('Fiyat'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is neither announced nor marked clickable for accessibility services', () => {
    // Regresyon: `accessible={false}` tek başına yetmiyordu; Pressable görünümü yine "tıklanabilir"
    // işaretliyor ve Play 24–27dp'lik kart şeritlerini ayrı dokunma hedefi sayıyordu.
    renderWithTamagui(
      <SecondaryPressArea onPress={jest.fn()} testID="alan">
        <Paragraph>Şerit</Paragraph>
      </SecondaryPressArea>,
    );

    const area = screen.getByTestId('alan');
    expect(area.props.accessible).toBe(false);
    expect(area.props.focusable).toBe(false);
  });
});
