import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CornerChipButton } from '@/components/ui/corner-chip-button';
import { renderWithTamagui } from '@/test/render-with-tamagui';

function buttonStyle(label: string) {
  return StyleSheet.flatten(screen.getByLabelText(label).props.style);
}

/** Dokunma kutusunu konumlandıran kapsayıcı, butonun hemen üstündeki görünüm. */
function wrapperStyle(label: string) {
  let node = screen.getByLabelText(label).parent;
  while (node && StyleSheet.flatten(node.props?.style)?.position !== 'absolute') {
    node = node.parent;
  }
  return StyleSheet.flatten(node?.props.style);
}

describe('CornerChipButton', () => {
  it('keeps a small chip where it was and gives it a 48dp touch box', () => {
    // Regresyon: 22–26dp "VİDEO" ve renk çipleri Play "Dokunma hedefi boyutu" uyarısı veriyordu.
    renderWithTamagui(
      <CornerChipButton accessibilityLabel="Renkler" corner="bottomRight" offsetX={8} offsetY={24} onPress={jest.fn()}>
        <Paragraph>çip</Paragraph>
      </CornerChipButton>,
    );

    expect(buttonStyle('Renkler')).toMatchObject({
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      minHeight: 48,
      minWidth: 48,
      paddingBottom: 8,
      paddingRight: 8,
    });
    // Kutu, çipin görünen konumundan şeffaf pay kadar dışarıda başlar: çip yine sağdan 8, alttan 24dp'de.
    expect(wrapperStyle('Renkler')).toMatchObject({ bottom: 16, position: 'absolute', right: 0 });
  });

  it.each([
    ['topLeft', { left: 0, top: 0 }, { alignItems: 'flex-start', justifyContent: 'flex-start' }],
    ['topRight', { right: 0, top: 0 }, { alignItems: 'flex-end', justifyContent: 'flex-start' }],
    ['bottomLeft', { bottom: 0, left: 0 }, { alignItems: 'flex-start', justifyContent: 'flex-end' }],
    ['bottomRight', { bottom: 0, right: 0 }, { alignItems: 'flex-end', justifyContent: 'flex-end' }],
  ] as const)('pins the chip to the %s corner', (corner, position, alignment) => {
    renderWithTamagui(
      <CornerChipButton accessibilityLabel="Köşe" corner={corner} offsetX={8} offsetY={8} onPress={jest.fn()}>
        <Paragraph>çip</Paragraph>
      </CornerChipButton>,
    );

    expect(wrapperStyle('Köşe')).toMatchObject(position);
    expect(buttonStyle('Köşe')).toMatchObject(alignment);
  });

  it('never lets the touch box start outside its container', () => {
    // Kapsayıcının dışına taşan kısım dokunuş almaz; pay, çipin kenara uzaklığıyla sınırlı.
    renderWithTamagui(
      <CornerChipButton accessibilityLabel="Yakın" corner="topLeft" offsetX={4} offsetY={2} onPress={jest.fn()}>
        <Paragraph>çip</Paragraph>
      </CornerChipButton>,
    );

    expect(wrapperStyle('Yakın')).toMatchObject({ left: 0, top: 0 });
    expect(buttonStyle('Yakın')).toMatchObject({ paddingLeft: 4, paddingTop: 2 });
  });

  it('calls onPress and keeps its label and chip in the dark theme', () => {
    const onPress = jest.fn();
    renderWithTamagui(
      <CornerChipButton accessibilityLabel="Video" corner="bottomLeft" offsetX={16} offsetY={20} onPress={onPress}>
        <Paragraph>VİDEO</Paragraph>
      </CornerChipButton>,
      'dark',
    );

    expect(screen.getByText('VİDEO')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Video'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
