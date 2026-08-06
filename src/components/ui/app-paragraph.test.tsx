import { screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { COMPACT_MAX_FONT_SCALE, MAX_FONT_SCALE } from '@/lib/theme/font-scale';
import { Paragraph } from './app-paragraph';

describe('Paragraph', () => {
  it('caps OS font scaling by default', () => {
    renderWithTamagui(<Paragraph>Merhaba</Paragraph>);

    expect(screen.getByText('Merhaba').props.maxFontSizeMultiplier).toBe(MAX_FONT_SCALE);
  });

  it('lets a constrained surface tighten the cap', () => {
    renderWithTamagui(
      <Paragraph maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}>Sepetim</Paragraph>,
    );

    expect(screen.getByText('Sepetim').props.maxFontSizeMultiplier).toBe(COMPACT_MAX_FONT_SCALE);
  });
});
