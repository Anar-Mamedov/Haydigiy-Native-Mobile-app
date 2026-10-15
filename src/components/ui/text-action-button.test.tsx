import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Paragraph } from '@/components/ui/app-paragraph';
import { TextActionButton } from '@/components/ui/text-action-button';
import { renderWithTamagui } from '@/test/render-with-tamagui';

function styleOf(label: string) {
  return StyleSheet.flatten(screen.getByLabelText(label).props.style);
}

describe('TextActionButton', () => {
  it('announces its text as a button and calls onPress', () => {
    const onPress = jest.fn();
    renderWithTamagui(<TextActionButton color="$color10" label="Beden Tablosu" onPress={onPress} />);

    const button = screen.getByLabelText('Beden Tablosu');
    expect(button.props.accessibilityRole).toBe('button');
    expect(screen.getByText('Beden Tablosu')).toBeTruthy();

    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps a 48dp touch area around small text', () => {
    // Regresyon: 22dp yüksekliğindeki yazılı aksiyonlar Play "Dokunma hedefi boyutu" uyarısı veriyordu;
    // `hitSlop` taramaya görünmediği için alanı kutunun kendisi taşımalı.
    renderWithTamagui(<TextActionButton color="$brand" fontSize={11} label="Bedenimi hesapla" onPress={jest.fn()} />);

    expect(styleOf('Bedenimi hesapla')).toMatchObject({ minHeight: 48, minWidth: 48 });
  });

  it('uses a separate accessibility label and state when given', () => {
    renderWithTamagui(
      <TextActionButton
        accessibilityLabel="12 değerlendirme"
        accessibilityState={{ expanded: true }}
        color="$color10"
        label="12 Değerlendirme"
        onPress={jest.fn()}
      />,
    );

    const button = screen.getByLabelText('12 değerlendirme');
    expect(button.props.accessibilityState).toMatchObject({ expanded: true });
    expect(screen.getByText('12 Değerlendirme')).toBeTruthy();
  });

  it('renders icons on both sides of the text', () => {
    renderWithTamagui(
      <TextActionButton
        color="$color10"
        icon={<Paragraph>önce</Paragraph>}
        iconAfter={<Paragraph>sonra</Paragraph>}
        label="Bağlantı"
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText('önce')).toBeTruthy();
    expect(screen.getByText('sonra')).toBeTruthy();
  });

  it('underlines the text and can hug its content inside a column', () => {
    renderWithTamagui(
      <TextActionButton alignSelf="flex-start" color="$color10" label="Altı çizili" onPress={jest.fn()} underline />,
    );

    expect(styleOf('Altı çizili')).toMatchObject({ alignSelf: 'flex-start' });
    expect(StyleSheet.flatten(screen.getByText('Altı çizili').props.style)).toMatchObject({
      textDecorationLine: 'underline',
    });
  });

  it('keeps its label readable in the dark theme', () => {
    renderWithTamagui(<TextActionButton color="$color10" label="Devamını Gör" onPress={jest.fn()} />, 'dark');

    expect(screen.getByLabelText('Devamını Gör')).toBeTruthy();
    expect(screen.getByText('Devamını Gör')).toBeTruthy();
    expect(styleOf('Devamını Gör')).toMatchObject({ minHeight: 48 });
  });
});
