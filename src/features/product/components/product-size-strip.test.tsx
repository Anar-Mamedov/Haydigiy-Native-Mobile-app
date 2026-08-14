import { screen } from '@testing-library/react-native';
import { ProductSizeStrip } from './product-size-strip';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const sizes = [
  { name: '44', hasStock: true },
  { name: '46', hasStock: false },
  { name: '48', hasStock: false },
];

describe('ProductSizeStrip', () => {
  it('renders every size so nothing is hidden outside the card', () => {
    renderWithTamagui(<ProductSizeStrip sizes={sizes} />);

    expect(screen.getByText('44')).toBeTruthy();
    expect(screen.getByText('46')).toBeTruthy();
    expect(screen.getByText('48')).toBeTruthy();
  });

  it('scrolls horizontally when the sizes overflow the card width', () => {
    renderWithTamagui(<ProductSizeStrip sizes={sizes} />);

    const strip = screen.getByTestId('product-size-strip');

    expect(strip.props.horizontal).toBe(true);
    expect(strip.props.scrollEnabled).not.toBe(false);
  });

  it('announces stock availability for each size', () => {
    renderWithTamagui(<ProductSizeStrip sizes={sizes} />);

    expect(screen.getByLabelText('44 beden, stokta var')).toBeTruthy();
    expect(screen.getByLabelText('46 beden, tükendi')).toBeTruthy();
  });

  it('renders nothing when the product has no sizes', () => {
    renderWithTamagui(<ProductSizeStrip sizes={[]} />);

    expect(screen.queryByTestId('product-size-strip')).toBeNull();
  });

  it('keeps duplicate size names distinct', () => {
    renderWithTamagui(
      <ProductSizeStrip
        sizes={[
          { name: 'STD', hasStock: true },
          { name: 'STD', hasStock: false },
        ]}
      />,
    );

    expect(screen.getAllByText('STD')).toHaveLength(2);
  });
});
