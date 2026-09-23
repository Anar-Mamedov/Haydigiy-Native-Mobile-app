import { screen } from '@testing-library/react-native';
import { Button, H2, SizableText } from 'tamagui';
import { config } from '../../../tamagui.config';
import { AppInput } from '@/components/ui/app-input';
import { SearchInput } from '@/components/ui/search-input';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { COMPACT_MAX_FONT_SCALE, FONT_SCALE_DEFAULT_PROPS, MAX_FONT_SCALE } from './font-scale';

// OS yazı boyutu tavanı native metin/input'a gerçekten ulaşıyor mu? Uygulamanın tek metin
// bileşeni olan `Paragraph` dışından render edilen her şey bu yollara güveniyor.
describe('OS font scale ceiling', () => {
  it('is registered in the app Tamagui config', () => {
    expect(config.defaultProps).toEqual(expect.objectContaining(FONT_SCALE_DEFAULT_PROPS));
  });

  it('caps texts rendered without the app Paragraph', () => {
    renderWithTamagui(
      <>
        <SizableText>Etiket</SizableText>
        <H2>Başlık</H2>
      </>,
    );

    expect(screen.getByText('Etiket').props.maxFontSizeMultiplier).toBe(MAX_FONT_SCALE);
    expect(screen.getByText('Başlık').props.maxFontSizeMultiplier).toBe(MAX_FONT_SCALE);
  });

  it('caps the label inside a Tamagui Button', () => {
    renderWithTamagui(<Button>Kaydet</Button>);

    expect(screen.getByText('Kaydet').props.maxFontSizeMultiplier).toBe(MAX_FONT_SCALE);
  });

  it('keeps a tighter cap passed by a compact surface', () => {
    renderWithTamagui(<SizableText maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}>Rozet</SizableText>);

    expect(screen.getByText('Rozet').props.maxFontSizeMultiplier).toBe(COMPACT_MAX_FONT_SCALE);
  });

  // Tamagui Input config varsayılanını almıyor; paylaşılan input'lar tavanı kendileri verir.
  it('caps the shared inputs', () => {
    renderWithTamagui(
      <>
        <AppInput label="Kupon kodu" onChangeText={jest.fn()} value="" />
        <SearchInput onChangeText={jest.fn()} placeholder="Ürün ara" value="" />
      </>,
    );

    expect(screen.getByLabelText('Kupon kodu').props.maxFontSizeMultiplier).toBe(MAX_FONT_SCALE);
    expect(screen.getByPlaceholderText('Ürün ara').props.maxFontSizeMultiplier).toBe(MAX_FONT_SCALE);
  });
});
