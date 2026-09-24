import { screen } from '@testing-library/react-native';
import { SINGLE_PRICE_COLOR, SINGLE_PRICE_COLOR_DARK } from '@/lib/theme/colors';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { BundleSeparatePriceNote } from './bundle-separate-price-note';

describe('BundleSeparatePriceNote', () => {
  it('labels the separate-purchase total and strikes it through', () => {
    renderWithTamagui(<BundleSeparatePriceNote itemsTotal={339.98} />);

    expect(screen.getByText('Ayrı ayrı alırsan')).toBeTruthy();
    expect(screen.getByText('339,98 TL')).toHaveStyle({ textDecorationLine: 'line-through' });
  });

  it('paints the total red like the single price in the package detail', () => {
    renderWithTamagui(<BundleSeparatePriceNote itemsTotal={339.98} />);

    expect(screen.getByText('339,98 TL')).toHaveStyle({ color: SINGLE_PRICE_COLOR });
  });

  it('switches to the lighter red in the dark theme so the total stays readable', () => {
    renderWithTamagui(<BundleSeparatePriceNote itemsTotal={339.98} />, 'dark');

    expect(screen.getByText('Ayrı ayrı alırsan')).toBeTruthy();
    expect(screen.getByText('339,98 TL')).toHaveStyle({ color: SINGLE_PRICE_COLOR_DARK });
  });

  it('reads the line to screen readers as one sentence', () => {
    renderWithTamagui(<BundleSeparatePriceNote itemsTotal={339.98} />);

    expect(screen.getByLabelText('Ayrı ayrı alırsan 339,98 TL')).toBeTruthy();
  });

  it('draws nothing for an unusable total', () => {
    renderWithTamagui(<BundleSeparatePriceNote itemsTotal={Number.NaN} />);

    expect(screen.queryByText('Ayrı ayrı alırsan')).toBeNull();
  });
});
