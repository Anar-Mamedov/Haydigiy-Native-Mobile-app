import { Text } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OrderItemGroupCard } from './order-item-group-card';
import { OrderItemGroup, OrderItemSelectionRow } from '../utils/order-item-groups';
import { OrderDetailItem } from '@/types/order.types';

function makeRow(id: number, name: string): OrderItemSelectionRow {
  const item: OrderDetailItem = {
    id,
    name,
    variantName: 'L',
    slug: 'urun',
    image: 'https://cdn/urun.webp',
    quantity: 1,
    price: 1250,
    kind: 'normal',
  };

  return {
    expandedId: `${id}-0`,
    item,
    orderItemId: id,
    quantity: 1,
    isNonReturnable: false,
    isBundleComponent: true,
  };
}

const BUNDLE_GROUP: OrderItemGroup = {
  groupId: 'bundle:101703d9',
  isBundle: true,
  header: {
    title: 'Deneme bundle',
    subtitle: '',
    imageUrl: 'https://cdn/bundle.webp',
    price: 2500,
    quantity: 1,
  },
  rows: [makeRow(8801, 'Kemer Detaylı Elbise'), makeRow(8802, 'Kruvaze Ceket')],
};

const PRODUCT_GROUP: OrderItemGroup = {
  groupId: 'item:9001',
  isBundle: false,
  header: null,
  rows: [makeRow(9001, 'Uzun Kollu Gömlek')],
};

function renderCard(
  overrides: Partial<React.ComponentProps<typeof OrderItemGroupCard>> = {},
  theme?: 'light' | 'dark',
) {
  const onToggleAll = overrides.onToggleAll ?? jest.fn();

  const utils = renderWithTamagui(
    <OrderItemGroupCard group={BUNDLE_GROUP} selectedIds={[]} {...overrides} onToggleAll={onToggleAll}>
      <Text>satır içeriği</Text>
    </OrderItemGroupCard>,
    theme,
  );

  return { ...utils, onToggleAll };
}

describe('OrderItemGroupCard — paket grubu', () => {
  it('frames the package with its name, badge and total', () => {
    renderCard();

    expect(screen.getByText('Deneme bundle')).toBeTruthy();
    expect(screen.getByText('PAKET')).toBeTruthy();
    expect(screen.getByText('satır içeriği')).toBeTruthy();
  });

  it('tells the shopper products can be picked one by one', () => {
    renderCard();

    expect(
      screen.getByText('Paket içeriği (2 ürün) — dilediğiniz ürünü tek tek seçebilirsiniz'),
    ).toBeTruthy();
  });

  it('counts how many products of the package are selected', () => {
    renderCard({ selectedIds: ['8801-0'] });

    expect(screen.getByText('1/2 seçildi')).toBeTruthy();
  });

  it('only checks the header box once every product is selected', () => {
    const partial = renderCard({ selectedIds: ['8801-0'] });
    expect(
      partial.getByLabelText('Deneme bundle paketindeki tüm ürünleri seç').props
        .accessibilityState.checked,
    ).toBe(false);
    partial.unmount();

    renderCard({ selectedIds: ['8801-0', '8802-0'] });
    expect(
      screen.getByLabelText('Deneme bundle paketindeki tüm ürünleri seç').props.accessibilityState
        .checked,
    ).toBe(true);
  });

  it('selects the whole package from the header box', () => {
    const { onToggleAll } = renderCard();

    fireEvent.press(screen.getByLabelText('Deneme bundle paketindeki tüm ürünleri seç'));

    expect(onToggleAll).toHaveBeenCalledTimes(1);
  });

  it('does not toggle the package while the flow is disabled', () => {
    const { onToggleAll } = renderCard({ disabled: true });

    fireEvent.press(screen.getByLabelText('Deneme bundle paketindeki tüm ürünleri seç'));

    expect(onToggleAll).not.toHaveBeenCalled();
  });

  it('keeps the package chrome readable in the dark theme', () => {
    renderCard({ selectedIds: ['8801-0'] }, 'dark');

    expect(screen.getByText('PAKET')).toBeTruthy();
    expect(screen.getByText('Deneme bundle')).toBeTruthy();
    expect(screen.getByText('Paketin tamamını seç')).toBeTruthy();
  });
});

describe('OrderItemGroupCard — normal ürün grubu', () => {
  it('renders the row untouched, with no package chrome', () => {
    renderCard({ group: PRODUCT_GROUP });

    expect(screen.getByText('satır içeriği')).toBeTruthy();
    expect(screen.queryByText('PAKET')).toBeNull();
    expect(screen.queryByText('Paketin tamamını seç')).toBeNull();
  });
});
