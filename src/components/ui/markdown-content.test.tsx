import { screen } from '@testing-library/react-native';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('MarkdownContent', () => {
  it('renders markdown syntax as native content', () => {
    renderWithTamagui(
      <MarkdownContent>{'# Ürün Başlığı\n\nBu **kalın** ve *italik* açıklama.'}</MarkdownContent>
    );

    expect(screen.getByText('Ürün Başlığı')).toBeTruthy();
    expect(screen.getByText('kalın')).toBeTruthy();
    expect(screen.getByText('italik')).toBeTruthy();
    expect(screen.queryByText('# Ürün Başlığı')).toBeNull();
    expect(screen.queryByText('Bu **kalın** ve *italik* açıklama.')).toBeNull();
  });
});
