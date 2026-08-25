import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CancelItemRow } from './cancel-item-row';
import { OrderDetailItem } from '@/types/order.types';

const ITEM: OrderDetailItem = {
  id: 8801,
  name: 'Kemer Detaylı Elbise',
  variantName: 'L',
  slug: 'kemer-detayli-elbise',
  image: 'https://cdn/elbise.webp',
  quantity: 1,
  price: 1250,
  kind: 'normal',
};

function renderRow(
  overrides: Partial<React.ComponentProps<typeof CancelItemRow>> = {},
  theme?: 'light' | 'dark',
) {
  const onToggle = overrides.onToggle ?? jest.fn();
  const onPressReason = overrides.onPressReason ?? jest.fn();

  const utils = renderWithTamagui(
    <CancelItemRow
      disabled={false}
      item={ITEM}
      selected={false}
      {...overrides}
      onPressReason={onPressReason}
      onToggle={onToggle}
    />,
    theme,
  );

  return { ...utils, onToggle, onPressReason };
}

describe('CancelItemRow', () => {
  it('shows the product name, size and price', () => {
    renderRow();

    expect(screen.getByText('Kemer Detaylı Elbise')).toBeTruthy();
    expect(screen.getByText('Beden: L')).toBeTruthy();
  });

  it('selects a single unit — a package product is cancellable on its own', () => {
    const { onToggle } = renderRow();

    fireEvent.press(screen.getByLabelText('Kemer Detaylı Elbise seç'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not toggle while the row is disabled', () => {
    const { onToggle } = renderRow({ disabled: true });

    fireEvent.press(screen.getByLabelText('Kemer Detaylı Elbise seç'));

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('asks for a cancellation reason once the row is selected', () => {
    const { onPressReason } = renderRow({ selected: true });

    expect(screen.getByText('İptal Nedeni')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Kemer Detaylı Elbise için iptal nedeni seç'));

    expect(onPressReason).toHaveBeenCalledTimes(1);
  });

  it('shows the picked reason instead of the placeholder', () => {
    renderRow({ selected: true, reasonLabel: 'Vazgeçtim' });

    expect(screen.getByText('Vazgeçtim')).toBeTruthy();
    expect(screen.queryByText('İptal nedeni seçin')).toBeNull();
  });

  it('hides the reason picker while the row is unselected', () => {
    renderRow();

    expect(screen.queryByText('İptal Nedeni')).toBeNull();
  });

  it('keeps the labels readable in the dark theme', () => {
    renderRow({ selected: true }, 'dark');

    expect(screen.getByText('Kemer Detaylı Elbise')).toBeTruthy();
    expect(screen.getByText('İptal nedeni seçin')).toBeTruthy();
  });
});
