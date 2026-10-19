import { fireEvent, screen } from '@testing-library/react-native';
import { SUBCATEGORY_STRIP_HEIGHT, SubcategoryStrip } from './subcategory-strip';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductSubcategory } from '@/types/product.types';

const subcategories: ProductSubcategory[] = [
  { id: 11, name: 'Kadın Üst Giyim', slug: 'kadin-ust-giyim' },
  { id: 170, name: 'Kadın Alt Giyim', slug: 'kadin-alt-giyim' },
];

describe('SubcategoryStrip', () => {
  it('lists every subcategory in one horizontally scrollable row', () => {
    renderWithTamagui(<SubcategoryStrip onSelect={jest.fn()} subcategories={subcategories} />);

    expect(screen.getByTestId('subcategory-strip').props.horizontal).toBe(true);
    expect(screen.getByText('Kadın Üst Giyim')).toBeTruthy();
    expect(screen.getByText('Kadın Alt Giyim')).toBeTruthy();
  });

  it('passes the tapped subcategory to onSelect', () => {
    const onSelect = jest.fn();
    renderWithTamagui(<SubcategoryStrip onSelect={onSelect} subcategories={subcategories} />);

    fireEvent.press(screen.getByLabelText('Kadın Alt Giyim kategorisine git'));

    expect(onSelect).toHaveBeenCalledWith(subcategories[1]);
  });

  it('exposes each chip as a link with a 48dp touch target', () => {
    renderWithTamagui(<SubcategoryStrip onSelect={jest.fn()} subcategories={subcategories} />);

    const chip = screen.getByTestId('subcategory-chip-11');
    expect(chip.props.accessibilityRole).toBe('link');
    expect(chip.props.style).toEqual(expect.objectContaining({ minHeight: MIN_TOUCH_TARGET }));
    expect(SUBCATEGORY_STRIP_HEIGHT).toBe(MIN_TOUCH_TARGET + 1);
  });

  it('renders nothing when the category has no subcategories', () => {
    renderWithTamagui(<SubcategoryStrip onSelect={jest.fn()} subcategories={[]} />);

    expect(screen.queryByTestId('subcategory-strip')).toBeNull();
  });
});
