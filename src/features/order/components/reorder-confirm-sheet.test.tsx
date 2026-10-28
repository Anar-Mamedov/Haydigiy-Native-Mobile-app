import { fireEvent, screen, within } from '@testing-library/react-native';
import { ReorderConfirmSheet } from './reorder-confirm-sheet';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import type { ReorderConfirmation, ReorderItem } from '@/types/order.types';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'sheet-root', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, props);
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

const BASE_ITEM: ReorderItem = {
  key: '11',
  orderItemId: 11,
  productId: 501,
  variantId: 9001,
  name: 'Kruvaze Ceket',
  variantName: 'M',
  slug: 'kruvaze-ceket',
  imageUrl: 'https://cdn.test/ceket.webp',
  requestedQuantity: 1,
  currentStock: 0,
  price: 899.9,
};

const CONFIRMATION: ReorderConfirmation = {
  kind: 'needsConfirmation',
  message: 'Siparişinizdeki bazı ürünler tükenmiştir.',
  outOfStockItems: [{ ...BASE_ITEM, reason: 'Stok tükendi' }],
  availableItems: [
    {
      ...BASE_ITEM,
      key: '12',
      orderItemId: 12,
      name: 'Uzun Kollu Gömlek',
      variantName: 'L',
      imageUrl: null,
      requestedQuantity: 3,
      currentStock: 1,
      addQuantity: 1,
      isPartialStock: true,
    },
    {
      ...BASE_ITEM,
      key: '13',
      orderItemId: 13,
      name: 'Hasır Çanta',
      variantName: '',
      requestedQuantity: 2,
      currentStock: 8,
      addQuantity: 2,
      isPartialStock: false,
    },
  ],
};

const baseProps = {
  open: true,
  confirmation: CONFIRMATION,
  isConfirming: false,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ReorderConfirmSheet', () => {
  it('shows the backend message and both product lists', () => {
    renderWithTamagui(<ReorderConfirmSheet {...baseProps} />);

    expect(screen.getByText('Siparişi Tekrarla')).toBeTruthy();
    expect(screen.getByText('Siparişinizdeki bazı ürünler tükenmiştir.')).toBeTruthy();

    const soldOut = within(screen.getByTestId('reorder-out-of-stock-section'));
    expect(soldOut.getByText('Tükenen ürünler')).toBeTruthy();
    const ceket = within(screen.getByTestId('reorder-out-of-stock-item-11'));
    expect(ceket.getByText('Kruvaze Ceket')).toBeTruthy();
    expect(ceket.getByText('Beden: M')).toBeTruthy();
    expect(ceket.getByText('Stok tükendi')).toBeTruthy();

    const available = within(screen.getByTestId('reorder-available-section'));
    expect(available.getByText('Sepete eklenecek ürünler')).toBeTruthy();
    const gomlek = within(screen.getByTestId('reorder-available-item-12'));
    expect(gomlek.getByText('Uzun Kollu Gömlek')).toBeTruthy();
    expect(gomlek.getByText('Beden: L · 1 adet')).toBeTruthy();
    expect(gomlek.getByText('Stokta 1 adet var')).toBeTruthy();

    // Bedensiz ve stoğu yeten üründe beden ve stok uyarısı çıkmaz.
    const canta = within(screen.getByTestId('reorder-available-item-13'));
    expect(canta.getByText('2 adet')).toBeTruthy();
    expect(canta.queryByText(/Stokta/)).toBeNull();
  });

  it('shows the product image, or a placeholder when there is none', () => {
    renderWithTamagui(<ReorderConfirmSheet {...baseProps} />);

    expect(screen.getByTestId('reorder-out-of-stock-item-11-image')).toBeTruthy();
    expect(screen.queryByTestId('reorder-out-of-stock-item-11-placeholder')).toBeNull();
    expect(screen.getByTestId('reorder-available-item-12-placeholder')).toBeTruthy();
    expect(screen.queryByTestId('reorder-available-item-12-image')).toBeNull();
  });

  it('falls back to the placeholder when the image fails to load', () => {
    renderWithTamagui(<ReorderConfirmSheet {...baseProps} />);

    fireEvent(screen.getByTestId('reorder-out-of-stock-item-11-image'), 'error', {
      nativeEvent: { error: 'HTTP 404' },
    });

    expect(screen.getByTestId('reorder-out-of-stock-item-11-placeholder')).toBeTruthy();
  });

  it('confirms with "Evet, mevcut olanları ekle" and cancels with "Vazgeç"', () => {
    renderWithTamagui(<ReorderConfirmSheet {...baseProps} />);

    fireEvent.press(screen.getByRole('button', { name: 'Evet, mevcut olanları ekle' }));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByRole('button', { name: 'Vazgeç' }));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('cancels when the overlay closes the sheet', () => {
    renderWithTamagui(<ReorderConfirmSheet {...baseProps} />);

    screen.getByTestId('sheet-root').props.onOpenChange(false);

    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('locks both actions while the items are being added', () => {
    renderWithTamagui(<ReorderConfirmSheet {...baseProps} isConfirming />);

    expect(screen.getByRole('button', { name: 'Ekleniyor...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Vazgeç' })).toBeDisabled();
    screen.getByTestId('sheet-root').props.onOpenChange(false);
    expect(baseProps.onCancel).not.toHaveBeenCalled();
  });

  it('uses the fitted, scrollable shared sheet with a bottom cover', () => {
    renderWithTamagui(<ReorderConfirmSheet {...baseProps} />);

    expect(screen.getByTestId('sheet-root').props.snapPointsMode).toBe('fit');
    expect(screen.getByTestId('reorder-confirm-sheet-bottom-cover')).toBeTruthy();
    const scroll = screen.getByTestId('reorder-confirm-sheet-scroll');
    expect(scroll.props.bounces).toBe(false);
    expect(within(scroll).getByText('Kruvaze Ceket')).toBeTruthy();
  });

  it('hides a section that has no products', () => {
    renderWithTamagui(
      <ReorderConfirmSheet
        {...baseProps}
        confirmation={{ ...CONFIRMATION, outOfStockItems: [] }}
      />,
    );

    expect(screen.queryByTestId('reorder-out-of-stock-section')).toBeNull();
    expect(screen.getByTestId('reorder-available-section')).toBeTruthy();
  });

  it('renders nothing while closed', () => {
    renderWithTamagui(<ReorderConfirmSheet {...baseProps} open={false} />);

    expect(screen.queryByText('Siparişi Tekrarla')).toBeNull();
  });

  it('keeps every label readable in the dark theme', () => {
    renderWithTamagui(<ReorderConfirmSheet {...baseProps} />, 'dark');

    expect(screen.getByText('Tükenen ürünler')).toBeTruthy();
    expect(screen.getByText('Sepete eklenecek ürünler')).toBeTruthy();
    expect(screen.getByText('Stok tükendi')).toBeTruthy();
    expect(screen.getByText('Stokta 1 adet var')).toBeTruthy();
    expect(screen.getByText('Evet, mevcut olanları ekle')).toBeTruthy();
    expect(screen.getByText('Vazgeç')).toBeTruthy();
  });
});
