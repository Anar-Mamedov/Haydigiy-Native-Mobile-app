import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { StorePickupLocation } from './store-pickup-location';

describe('StorePickupLocation', () => {
  it.each(['light', 'dark'] as const)('renders the address and the map link in the %s theme', (theme) => {
    renderWithTamagui(<StorePickupLocation onPressMap={jest.fn()} />, theme);

    expect(screen.getByText(/Selçuk Mah\. Gemili Park Karşısı Haydigiy Mağaza\./)).toBeTruthy();
    expect(screen.getByLabelText('Konum İçin Tıklayın').props.accessibilityRole).toBe('link');
  });

  it('prefixes the address with the given label', () => {
    renderWithTamagui(<StorePickupLocation label="Teslim alma adresi" onPressMap={jest.fn()} />);

    expect(screen.getByText(/Teslim alma adresi:/)).toBeTruthy();
  });

  it('shows no label by default', () => {
    renderWithTamagui(<StorePickupLocation onPressMap={jest.fn()} />);

    expect(screen.queryByText(/Teslim alma adresi/)).toBeNull();
  });

  it('calls the map handler when the link is pressed', () => {
    const onPressMap = jest.fn();
    renderWithTamagui(<StorePickupLocation onPressMap={onPressMap} />);

    fireEvent.press(screen.getByLabelText('Konum İçin Tıklayın'));

    expect(onPressMap).toHaveBeenCalledTimes(1);
  });
});
