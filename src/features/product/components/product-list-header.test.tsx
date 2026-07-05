import { fireEvent, screen } from '@testing-library/react-native';
import { ProductListHeader } from './product-list-header';
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

function renderHeader(overrides: Partial<Parameters<typeof ProductListHeader>[0]> = {}) {
  const onToggleQuickFilter = jest.fn();
  renderWithTamagui(
    <ProductListHeader
      activeSortLabel="Önerilen Sıralama"
      activeFiltersCount={0}
      categoryFilterOptions={0}
      productCategories={undefined}
      colors={undefined}
      variants={undefined}
      priceRange={undefined}
      propertyIds={undefined}
      quickFilterGroups={quickFilterGroups}
      quickFilterSection={null}
      onSortPress={jest.fn()}
      onFilterPress={jest.fn()}
      onToggleQuickFilter={onToggleQuickFilter}
      {...overrides}
    />,
  );
  return { onToggleQuickFilter };
}

describe('ProductListHeader quick filter pills', () => {
  it('renders one pill per quick filter group and toggles its section', () => {
    const { onToggleQuickFilter } = renderHeader();

    fireEvent.press(screen.getByLabelText('Yaka Tipi filtresi'));
    expect(onToggleQuickFilter).toHaveBeenCalledWith('quick:153');

    fireEvent.press(screen.getByLabelText('Model filtresi'));
    expect(onToggleQuickFilter).toHaveBeenCalledWith('quick:13');
  });

  it('marks a group pill selected only when one of its values is applied', () => {
    renderHeader({ propertyIds: '165' });

    expect(
      screen.getByLabelText('Yaka Tipi filtresi').props.accessibilityState.selected,
    ).toBe(true);
    expect(
      screen.getByLabelText('Model filtresi').props.accessibilityState.selected,
    ).toBe(false);
  });

  it('renders no group pills without quick filter data', () => {
    renderHeader({ quickFilterGroups: [] });

    expect(screen.queryByLabelText('Yaka Tipi filtresi')).toBeNull();
    expect(screen.getByLabelText('Renk filtresi')).toBeTruthy();
  });
});
