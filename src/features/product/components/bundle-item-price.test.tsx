import { screen } from '@testing-library/react-native';
import {
  DISCOUNT_COLOR,
  DISCOUNT_COLOR_DARK,
  SINGLE_PRICE_COLOR,
  SINGLE_PRICE_COLOR_DARK,
} from '@/lib/theme/colors';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { BundleItemPrice } from './bundle-item-price';

describe('BundleItemPrice', () => {
  it('compares the single price with the package price under their own labels', () => {
    renderWithTamagui(<BundleItemPrice oldPrice={169.99} price={149.99} />);

    expect(screen.getByText('Tekli alırsan')).toBeTruthy();
    expect(screen.getByText('Pakette alırsan')).toBeTruthy();
    expect(screen.getByText('₺169,99')).toHaveStyle({ textDecorationLine: 'line-through' });
    expect(screen.getByText('₺149,99')).not.toHaveStyle({ textDecorationLine: 'line-through' });
  });

  it('paints the single price red and the package price green, like the web', () => {
    renderWithTamagui(<BundleItemPrice oldPrice={169.99} price={149.99} />);

    expect(screen.getByText('₺169,99')).toHaveStyle({ color: SINGLE_PRICE_COLOR });
    expect(screen.getByText('₺149,99')).toHaveStyle({ color: DISCOUNT_COLOR });
    expect(screen.getByText('Pakette alırsan')).toHaveStyle({ color: DISCOUNT_COLOR });
  });

  it('switches to the lighter red and green in the dark theme so both stay readable', () => {
    renderWithTamagui(<BundleItemPrice oldPrice={169.99} price={149.99} />, 'dark');

    expect(screen.getByText('₺169,99')).toHaveStyle({ color: SINGLE_PRICE_COLOR_DARK });
    expect(screen.getByText('₺149,99')).toHaveStyle({ color: DISCOUNT_COLOR_DARK });
  });

  it('reads the comparison to screen readers as one sentence', () => {
    renderWithTamagui(<BundleItemPrice oldPrice={169.99} price={149.99} />);

    expect(screen.getByLabelText('Tekli alırsan ₺169,99, pakette alırsan ₺149,99')).toBeTruthy();
  });

  it.each([
    ['there is no single price', null],
    ['the single price is the same', 149.99],
    ['the single price is lower', 120],
  ])('shows only the package price when %s', (_case, oldPrice) => {
    renderWithTamagui(<BundleItemPrice oldPrice={oldPrice} price={149.99} />);

    expect(screen.getByLabelText('Paket içi fiyatı ₺149,99')).toBeTruthy();
    expect(screen.getByText('₺149,99')).not.toHaveStyle({ textDecorationLine: 'line-through' });
    expect(screen.queryByText('Tekli alırsan')).toBeNull();
    expect(screen.queryByText('Pakette alırsan')).toBeNull();
  });

  it('draws nothing when the item has no price', () => {
    renderWithTamagui(<BundleItemPrice oldPrice={169.99} price={0} />);

    expect(screen.queryByText('Tekli alırsan')).toBeNull();
    expect(screen.queryByText('₺169,99')).toBeNull();
  });
});
