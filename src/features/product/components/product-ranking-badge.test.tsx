import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductRankingBadge } from './product-ranking-badge';

const RANKING_URL = '/kadin-buyuk-beden-elbise-ikili-takim?c=40&best=sales';

describe('ProductRankingBadge', () => {
  it.each(['light', 'dark'] as const)('opens the ranking list from the badge in the %s theme', (theme) => {
    const onPress = jest.fn();
    renderWithTamagui(<ProductRankingBadge onPress={onPress} text=" En Çok Satan 1. Ürün " url={RANKING_URL} />, theme);

    expect(screen.getByText('En Çok Satan 1. Ürün')).toBeTruthy();
    fireEvent.press(screen.getByRole('link', { name: 'En Çok Satan 1. Ürün listesini görüntüle' }));

    expect(onPress).toHaveBeenCalledWith(RANKING_URL);
  });

  it.each([
    ['no link', 'En Çok Satan 1. Ürün', null],
    ['no text', '  ', RANKING_URL],
  ])('is hidden with %s', (_case, text, url) => {
    renderWithTamagui(<ProductRankingBadge onPress={jest.fn()} text={text} url={url} />);

    expect(screen.queryByTestId('product-ranking-badge')).toBeNull();
  });

  it('keeps the 30dp badge inside a 48dp touch target', () => {
    renderWithTamagui(<ProductRankingBadge onPress={jest.fn()} text="En Çok Satan 1. Ürün" url={RANKING_URL} />);

    expect(screen.getByTestId('product-ranking-badge').props.style).toMatchObject({ minHeight: 48 });
  });
});
