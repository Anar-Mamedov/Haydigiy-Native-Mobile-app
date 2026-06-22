import { StyleSheet } from 'react-native';
import { screen } from '@testing-library/react-native';
import { AppButton } from '@/components/ui/app-button';
import { renderWithTamagui } from '@/test/render-with-tamagui';

/** Flattens the resolved style of a text node so we can assert its final color. */
function colorOf(label: string): unknown {
  return StyleSheet.flatten(screen.getByText(label).props.style)?.color;
}

describe('AppButton', () => {
  it('resolves a theme color token to a concrete color value', () => {
    // Regression: a token string passed straight to RN `style.color` does not
    // resolve and the label falls back to black (unreadable on dark surfaces).
    renderWithTamagui(<AppButton color="$red10">Çıkış Yap</AppButton>);

    const color = colorOf('Çıkış Yap');
    expect(typeof color).toBe('string');
    expect(color).not.toBe('$red10');
    expect(color).toMatch(/^#|^rgb|^hsl/);
  });

  it('passes a raw (non-token) color through unchanged', () => {
    renderWithTamagui(<AppButton color="#123456">Kaydet</AppButton>);

    expect(colorOf('Kaydet')).toBe('#123456');
  });
});
