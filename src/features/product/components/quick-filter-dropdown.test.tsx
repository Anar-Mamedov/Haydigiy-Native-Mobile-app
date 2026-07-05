import { fireEvent, screen } from '@testing-library/react-native';
import { QuickFilterDropdown } from './quick-filter-dropdown';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { QuickFilterGroup } from '@/types/product.types';

const quickFilterGroups: QuickFilterGroup[] = [
  {
    id: 13,
    name: 'Model',
    values: [
      { id: 3332, name: 'Abiye' },
      { id: 18, name: 'Günlük Elbise' },
    ],
  },
  {
    id: 153,
    name: 'Yaka Tipi',
    values: [
      { id: 3359, name: 'Straplez' },
      { id: 3360, name: 'Askılı' },
    ],
  },
];

function renderDropdown(overrides: Partial<Parameters<typeof QuickFilterDropdown>[0]> = {}) {
  const onChange = jest.fn();
  const onClose = jest.fn();
  renderWithTamagui(
    <QuickFilterDropdown
      activeFilters={{}}
      availableFilters={undefined}
      onChange={onChange}
      onClose={onClose}
      quickFilterGroups={quickFilterGroups}
      section="quick:153"
      {...overrides}
    />,
  );
  return { onChange, onClose };
}

describe('QuickFilterDropdown quick filter sections', () => {
  it('lists only the opened group values and toggles them into property_ids', () => {
    const { onChange } = renderDropdown();

    expect(screen.queryByLabelText('Abiye hızlı filtresi')).toBeNull();

    fireEvent.press(screen.getByLabelText('Straplez hızlı filtresi'));
    expect(onChange).toHaveBeenCalledWith({ property_ids: '3359' });
  });

  it('keeps selections from other groups while toggling values', () => {
    const { onChange } = renderDropdown({ activeFilters: { property_ids: '18' } });

    expect(
      screen.getByLabelText('Straplez hızlı filtresi').props.accessibilityState.checked,
    ).toBe(false);

    fireEvent.press(screen.getByLabelText('Straplez hızlı filtresi'));
    expect(onChange).toHaveBeenCalledWith({ property_ids: '18,3359' });
  });

  it('clears only the opened group ids and closes the dropdown', () => {
    const { onChange, onClose } = renderDropdown({
      activeFilters: { property_ids: '18,3359,3360' },
    });

    fireEvent.press(screen.getByText('Temizle'));
    expect(onChange).toHaveBeenCalledWith({ property_ids: '18' });
    expect(onClose).toHaveBeenCalled();
  });

  it('filters the value list through the group search field', () => {
    renderDropdown();

    fireEvent.changeText(screen.getByPlaceholderText('Yaka Tipi Ara'), 'ask');
    expect(screen.getByLabelText('Askılı hızlı filtresi')).toBeTruthy();
    expect(screen.queryByLabelText('Straplez hızlı filtresi')).toBeNull();
  });
});
