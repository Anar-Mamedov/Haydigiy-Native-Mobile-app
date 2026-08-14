import { fireEvent, screen } from '@testing-library/react-native';
import { ProductFilterBar } from './product-filter-bar';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { QuickFilterGroup } from '@/types/product.types';

const quickFilterGroups: QuickFilterGroup[] = [
  {
    id: 13,
    name: 'Model',
    values: [{ id: 18, name: 'Günlük Elbise' }],
  },
  {
    id: 153,
    name: 'Yaka Tipi',
    values: [
      { id: 3359, name: 'Straplez' },
      { id: 165, name: 'Bisiklet Yaka' },
    ],
  },
];

function renderBar(overrides: Partial<Parameters<typeof ProductFilterBar>[0]> = {}) {
  const onToggleQuickFilter = jest.fn();
  const onFilterPress = jest.fn();
  const onSortPress = jest.fn();
  renderWithTamagui(
    <ProductFilterBar
      activeFiltersCount={0}
      categoryFilterOptions={0}
      colors={undefined}
      isSortActive={false}
      openSection={null}
      priceRange={undefined}
      productCategories={undefined}
      propertyIds={undefined}
      quickFilterGroups={quickFilterGroups}
      variants={undefined}
      onFilterPress={onFilterPress}
      onSortPress={onSortPress}
      onToggleQuickFilter={onToggleQuickFilter}
      {...overrides}
    />,
  );
  return { onFilterPress, onSortPress, onToggleQuickFilter };
}

describe('ProductFilterBar', () => {
  it('collects sorting, filters and shortcuts in one horizontally scrollable row', () => {
    renderBar();

    const bar = screen.getByTestId('product-filter-bar');
    expect(bar.props.horizontal).toBe(true);

    expect(screen.getByText('Sırala')).toBeTruthy();
    expect(screen.getByText('Filtrele')).toBeTruthy();
    expect(screen.getByText('Beden')).toBeTruthy();
    expect(screen.getByText('Renk')).toBeTruthy();
    expect(screen.getByText('Fiyat')).toBeTruthy();
  });

  it('opens the sort and filter sheets from their pills', () => {
    const { onFilterPress, onSortPress } = renderBar();

    fireEvent.press(screen.getByLabelText('Sıralama seçenekleri'));
    expect(onSortPress).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByLabelText('Tüm filtreler'));
    expect(onFilterPress).toHaveBeenCalledTimes(1);
  });

  it('shows the active filter count as a badge on the filter pill', () => {
    renderBar({ activeFiltersCount: 2 });

    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByLabelText('Tüm filtreler').props.accessibilityState.selected).toBe(true);
  });

  it('caps the badge at 9+', () => {
    renderBar({ activeFiltersCount: 12 });

    expect(screen.getByText('9+')).toBeTruthy();
  });

  it('hides the badge without active filters', () => {
    renderBar();

    expect(screen.queryByText('9+')).toBeNull();
    expect(screen.getByLabelText('Tüm filtreler').props.accessibilityState.selected).toBe(false);
  });

  it('highlights the sort pill only when a non-default sorting is applied', () => {
    renderBar({ isSortActive: true });

    expect(screen.getByLabelText('Sıralama seçenekleri').props.accessibilityState.selected).toBe(true);
  });

  it('hides the category pill until the API reports category options', () => {
    renderBar();

    expect(screen.queryByLabelText('Kategori filtresi')).toBeNull();
  });

  it('shows the category pill once category options exist', () => {
    renderBar({ categoryFilterOptions: 3 });

    expect(screen.getByLabelText('Kategori filtresi')).toBeTruthy();
  });

  it('renders one pill per quick filter group and toggles its section', () => {
    const { onToggleQuickFilter } = renderBar();

    fireEvent.press(screen.getByLabelText('Yaka Tipi filtresi'));
    expect(onToggleQuickFilter).toHaveBeenCalledWith('quick:153');

    fireEvent.press(screen.getByLabelText('Model filtresi'));
    expect(onToggleQuickFilter).toHaveBeenCalledWith('quick:13');
  });

  it('marks a group pill selected only when one of its values is applied', () => {
    renderBar({ propertyIds: '165' });

    expect(screen.getByLabelText('Yaka Tipi filtresi').props.accessibilityState.selected).toBe(true);
    expect(screen.getByLabelText('Model filtresi').props.accessibilityState.selected).toBe(false);
  });

  it('renders no group pills without quick filter data', () => {
    renderBar({ quickFilterGroups: [] });

    expect(screen.queryByLabelText('Yaka Tipi filtresi')).toBeNull();
    expect(screen.getByLabelText('Renk filtresi')).toBeTruthy();
  });

  it('marks the open section expanded', () => {
    renderBar({ openSection: 'colors' });

    expect(screen.getByLabelText('Renk filtresi').props.accessibilityState.expanded).toBe(true);
    expect(screen.getByLabelText('Beden filtresi').props.accessibilityState.expanded).toBe(false);
  });
});
