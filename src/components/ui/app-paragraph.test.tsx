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

  describe('textTransform (Turkish)', () => {
    it('upper-cases with the dotted İ instead of handing it to the locale-blind native transform', () => {
      renderWithTamagui(<Paragraph textTransform="uppercase">Siparişleriniz</Paragraph>);

      const text = screen.getByText('SİPARİŞLERİNİZ');
      expect(text.props.style).not.toEqual(expect.objectContaining({ textTransform: expect.anything() }));
    });

    it('upper-cases mixed text and number children', () => {
      renderWithTamagui(
        <Paragraph textTransform="uppercase">
          {'İlk '}
          {3}
          {' sipariş'}
        </Paragraph>,
      );

      expect(screen.getByText('İLK 3 SİPARİŞ')).toBeTruthy();
    });

    it('capitalises and lower-cases the Turkish way', () => {
      renderWithTamagui(
        <>
          <Paragraph textTransform="capitalize">ilk sipariş</Paragraph>
          <Paragraph textTransform="lowercase">IŞIK İPEK</Paragraph>
        </>,
      );

      expect(screen.getByText('İlk Sipariş')).toBeTruthy();
      expect(screen.getByText('ışık ipek')).toBeTruthy();
    });

    it('leaves nested elements to the native transform', () => {
      renderWithTamagui(
        <Paragraph testID="outer" textTransform="uppercase">
          kalan <Paragraph>süre</Paragraph>
        </Paragraph>,
      );

      expect(screen.getByTestId('outer').props.style).toEqual(
        expect.objectContaining({ textTransform: 'uppercase' }),
      );
    });

    it('stays readable in dark mode', () => {
      renderWithTamagui(<Paragraph textTransform="uppercase">iade</Paragraph>, 'dark');

      expect(screen.getByText('İADE')).toBeTruthy();
    });
  });
});
