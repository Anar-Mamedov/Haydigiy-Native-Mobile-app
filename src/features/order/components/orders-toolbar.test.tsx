import { fireEvent, screen } from '@testing-library/react-native';
import { Input } from 'tamagui';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { TEXT_FIELD_PLACEHOLDER_COLOR } from '@/lib/theme/text-field-defaults';
import { OrdersToolbar } from './orders-toolbar';

jest.mock('expo-router', () => ({
  usePathname: () => '/orders',
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, push: jest.fn(), replace: jest.fn() }),
}));

function renderToolbar(onSearchChange = jest.fn()) {
  return renderWithTamagui(
    <OrdersToolbar dateFilter="all" onDateFilterChange={jest.fn()} onSearchChange={onSearchChange} search="" />,
  );
}

describe('OrdersToolbar', () => {
  // HMA-65: telefon koyu moddayken placeholder native varsayılana (beyaza yakın) düşüp
  // açık zeminde kayboluyordu; rengi tema vermeli.
  it('gives the search placeholder a theme color instead of the native default', () => {
    const { unmount } = renderWithTamagui(<Input placeholder="referans" placeholderTextColor={TEXT_FIELD_PLACEHOLDER_COLOR} />);
    const themed = screen.getByPlaceholderText('referans').props.placeholderTextColor;
    unmount();

    renderToolbar();

    expect(themed).toEqual(expect.any(String));
    expect(screen.getByPlaceholderText('Ürün/Sipariş ara').props.placeholderTextColor).toBe(themed);
  });

  it('reports typed search text', () => {
    const onSearchChange = jest.fn();
    renderToolbar(onSearchChange);

    fireEvent.changeText(screen.getByPlaceholderText('Ürün/Sipariş ara'), 'elbise');

    expect(onSearchChange).toHaveBeenCalledWith('elbise');
  });
});
