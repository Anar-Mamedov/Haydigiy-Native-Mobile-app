import { screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Input, TextArea, type ColorTokens } from 'tamagui';
import { config } from '../../../tamagui.config';
import { AppInput } from '@/components/ui/app-input';
import { SearchInput } from '@/components/ui/search-input';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { TEXT_FIELD_DEFAULT_PROPS, TEXT_FIELD_PLACEHOLDER_COLOR } from './text-field-defaults';

/** Tema token'ının native alana çözülmüş hâli: aynı token'ı açıkça veren bir referans alandan okunur. */
function resolvedPlaceholderColor(token: ColorTokens) {
  const { unmount } = renderWithTamagui(<Input placeholder="referans" placeholderTextColor={token} />);
  const color = screen.getByPlaceholderText('referans').props.placeholderTextColor;
  unmount();
  return color;
}

// HMA-65: placeholder rengi verilmeyen alanlar telefonun koyu modunda native varsayılana
// (beyaza yakın) düşüyordu. Renk config varsayılanından her alana ulaşmalı.
describe('text field placeholder color', () => {
  it('is registered in the app Tamagui config', () => {
    expect(config.defaultProps).toEqual(expect.objectContaining(TEXT_FIELD_DEFAULT_PROPS));
  });

  it('reaches a bare Tamagui Input, TextArea and the shared AppInput', () => {
    const expected = resolvedPlaceholderColor(TEXT_FIELD_PLACEHOLDER_COLOR);
    expect(expected).toEqual(expect.any(String));

    renderWithTamagui(
      <>
        <Input placeholder="Ürün/Sipariş ara" />
        <TextArea placeholder="Yorumunuz" />
        <AppInput label="Kupon kodu" onChangeText={jest.fn()} placeholder="Kupon" value="" />
      </>,
    );

    for (const placeholder of ['Ürün/Sipariş ara', 'Yorumunuz', 'Kupon']) {
      expect(screen.getByPlaceholderText(placeholder).props.placeholderTextColor).toBe(expected);
    }
  });

  it('lets a field override the default', () => {
    const expected = resolvedPlaceholderColor('$color11');

    renderWithTamagui(<Input placeholder="Özel" placeholderTextColor="$color11" />);

    expect(screen.getByPlaceholderText('Özel').props.placeholderTextColor).toBe(expected);
    expect(expected).not.toBe(resolvedPlaceholderColor(TEXT_FIELD_PLACEHOLDER_COLOR));
  });
});

/** Metin alanında yazılan metnin native `color` stili. */
function typedTextColor(placeholder: string) {
  return StyleSheet.flatten(screen.getByPlaceholderText(placeholder).props.style)?.color;
}

// HMA-65: yazılan metnin rengi de temadan gelmeli. Alan `color` taşımazsa native varsayılan
// kullanılır ve telefonun koyu modunda açık zeminde beyaz görünür.
describe('text field typed text color', () => {
  it('is set by the theme on every shared text field', () => {
    renderWithTamagui(
      <>
        <Input placeholder="Ürün/Sipariş ara" />
        <TextArea placeholder="Yorumunuz" />
        <AppInput label="Kupon kodu" onChangeText={jest.fn()} placeholder="Kupon" value="" />
        <SearchInput onChangeText={jest.fn()} placeholder="Sorularda Ara" value="" />
      </>,
    );

    for (const placeholder of ['Ürün/Sipariş ara', 'Yorumunuz', 'Kupon', 'Sorularda Ara']) {
      expect(typedTextColor(placeholder)).toEqual(expect.any(String));
    }
  });
});
