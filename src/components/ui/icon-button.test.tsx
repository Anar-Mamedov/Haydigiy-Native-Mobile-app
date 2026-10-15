import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { Paragraph } from '@/components/ui/app-paragraph';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import { HeaderTextButton } from '@/components/ui/header-text-button';
import { IconButton, MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { type AppIconProps, Heart } from '@/components/ui/icons';
import { renderWithTamagui } from '@/test/render-with-tamagui';

function styleOf(label: string) {
  return StyleSheet.flatten(screen.getByLabelText(label).props.style);
}

describe('MIN_TOUCH_TARGET', () => {
  it('is the 48dp Android touch target taken from the size token', () => {
    expect(MIN_TOUCH_TARGET).toBe(48);
  });
});

describe('IconButton', () => {
  it('exposes its label and button role and calls onPress', () => {
    const onPress = jest.fn();
    renderWithTamagui(
      <IconButton accessibilityLabel="Favorilerim" onPress={onPress}>
        <Heart size={22} />
      </IconButton>,
    );

    const button = screen.getByLabelText('Favorilerim');
    expect(button.props.accessibilityRole).toBe('button');

    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps a 48dp touch area around a small icon', () => {
    // Regresyon: 20–36dp ikon butonları Play "Dokunma hedefi boyutu" uyarısı veriyordu; `hitSlop`
    // taramaya görünmediği için alanı kutunun kendisi taşımalı.
    renderWithTamagui(
      <IconButton accessibilityLabel="Kapat" onPress={jest.fn()}>
        <Heart size={10} />
      </IconButton>,
    );

    expect(styleOf('Kapat')).toMatchObject({ minHeight: 48, minWidth: 48 });
  });

  it('never shrinks below 48dp even when a smaller size is requested', () => {
    renderWithTamagui(
      <IconButton accessibilityLabel="Küçük" onPress={jest.fn()} size={24}>
        <Heart size={10} />
      </IconButton>,
    );

    expect(styleOf('Küçük')).toMatchObject({ minHeight: 48, minWidth: 48 });
  });

  it('can pin a small chip to a corner of the touch area', () => {
    renderWithTamagui(
      <IconButton
        accessibilityLabel="Köşe"
        alignItems="flex-end"
        justifyContent="flex-start"
        onPress={jest.fn()}
        padding={8}
      >
        <Heart size={14} />
      </IconButton>,
    );

    expect(styleOf('Köşe')).toMatchObject({ alignItems: 'flex-end', justifyContent: 'flex-start', padding: 8 });
  });

  it('renders its icon in both themes', () => {
    const light = renderWithTamagui(
      <IconButton accessibilityLabel="Tema" onPress={jest.fn()}>
        <Paragraph>ikon</Paragraph>
      </IconButton>,
    );
    expect(light.getByText('ikon')).toBeTruthy();
    light.unmount();

    renderWithTamagui(
      <IconButton accessibilityLabel="Tema" onPress={jest.fn()}>
        <Paragraph>ikon</Paragraph>
      </IconButton>,
      'dark',
    );
    expect(screen.getByLabelText('Tema')).toBeTruthy();
    expect(screen.getByText('ikon')).toBeTruthy();
  });
});

describe('HeaderBackButton', () => {
  it('is labelled "Geri dön" with a 48dp target and calls onPress', () => {
    const onPress = jest.fn();
    renderWithTamagui(<HeaderBackButton onPress={onPress} />);

    expect(styleOf('Geri dön')).toMatchObject({ minHeight: 48, minWidth: 48 });

    fireEvent.press(screen.getByLabelText('Geri dön'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('accepts another back icon without changing the label', () => {
    const TestChevron = jest.fn((_props: AppIconProps) => null);
    renderWithTamagui(<HeaderBackButton Icon={TestChevron} onPress={jest.fn()} />);

    expect(screen.getByLabelText('Geri dön')).toBeTruthy();
    expect(TestChevron.mock.calls[0][0]).toMatchObject({ color: '$color', size: 24 });
  });
});

describe('HeaderTextButton', () => {
  it('renders the label inside a 48dp touch area and calls onPress', () => {
    const onPress = jest.fn();
    renderWithTamagui(<HeaderTextButton color="$red11" label="Sepeti Temizle" onPress={onPress} />);

    expect(screen.getByText('Sepeti Temizle')).toBeTruthy();
    expect(styleOf('Sepeti Temizle')).toMatchObject({ minHeight: 48, minWidth: 48 });

    fireEvent.press(screen.getByLabelText('Sepeti Temizle'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps its label readable in the dark theme', () => {
    renderWithTamagui(<HeaderTextButton color="$red11" label="Temizle" onPress={jest.fn()} />, 'dark');

    expect(screen.getByLabelText('Temizle')).toBeTruthy();
    expect(screen.getByText('Temizle')).toBeTruthy();
  });
});
