import { screen } from '@testing-library/react-native';
import { OrderReturnSection } from './order-return-section';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OrderDetail, OrderDetailItem } from '@/types/order.types';

const mockCancelReturn = jest.fn();

jest.mock('@/components/ui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    AppAlertDialog: ({ open, children }: { open: boolean; children: unknown }) =>
      open ? React.createElement(View, null, children) : null,
  };
});

jest.mock('../hooks/use-cancel-return-request', () => ({
  useCancelReturnRequest: () => ({
    cancelReturn: mockCancelReturn,
    isCanceling: false,
    errorMessage: null,
    clearError: jest.fn(),
    successMessage: null,
    clearSuccess: jest.fn(),
  }),
}));

function makeReturnedItem(overrides: Partial<OrderDetailItem> = {}): OrderDetailItem {
  return {
    id: 5,
    name: 'İade Ürünü',
    variantName: 'S',
    slug: 'iade-urunu',
    image: null,
    quantity: 1,
    price: 139.99,
    kind: 'returned',
    returnRequestId: 42,
    returnCode: 'HG130626803895',
    returnRequestedAt: '04 Tem 2026 - 23:26',
    returnPickupDate: '17 Tem 2026',
    returnReceivedAt: null,
    returnStatusCode: 1,
    returnStatusName: '',
    ...overrides,
  };
}

function makeOrder(overrides: Partial<OrderDetail> = {}): OrderDetail {
  return {
    returnedItems: [makeReturnedItem()],
    cancellableReturnRequestId: 42,
    hasHepsijetReturn: false,
    orderNo: 'HG130626803895',
    id: 1,
    ...overrides,
  } as OrderDetail;
}

describe('OrderReturnSection', () => {
  beforeEach(() => {
    mockCancelReturn.mockClear();
  });

  it('shows the web-parity return card: code, date, pending chip and progress bar', () => {
    renderWithTamagui(<OrderReturnSection onPressProduct={jest.fn()} order={makeOrder()} />);

    expect(screen.getByText('İade Edildi')).toBeTruthy();
    expect(
      screen.getByText('Aşağıda gösterilen 1 ürün için iade talebi oluşturuldu.'),
    ).toBeTruthy();
    expect(screen.getByText('HG130626803895')).toBeTruthy();
    expect(screen.getByText('İade Tarihi: 04 Tem 2026 - 23:26')).toBeTruthy();
    expect(screen.getByText('Kargo Teslim Alma Tarihi: 17 Tem 2026')).toBeTruthy();
    expect(screen.getByText('İşlem Bekliyor')).toBeTruthy();
    expect(screen.getByText('İade Beklemede')).toBeTruthy();
    expect(screen.getByLabelText('İade talebini iptal et')).toBeTruthy();
  });

  it('hides the cancel action and explains why once the return shipped', () => {
    renderWithTamagui(
      <OrderReturnSection
        onPressProduct={jest.fn()}
        order={makeOrder({
          cancellableReturnRequestId: null,
          returnedItems: [
            makeReturnedItem({ returnStatusCode: 4, returnStatusName: 'Kargoya Verildi' }),
          ],
        })}
      />,
    );

    expect(screen.queryByLabelText('İade talebini iptal et')).toBeNull();
    expect(screen.getByText('Kargoya teslim edildiği için iptal edilemez.')).toBeTruthy();
    // Hem ilerleme çubuğu adımı hem durum çipi aynı etiketi taşır.
    expect(screen.getAllByText('Kargoya Verildi').length).toBeGreaterThanOrEqual(2);
  });

  it('renders nothing when there are no returned items', () => {
    renderWithTamagui(
      <OrderReturnSection
        onPressProduct={jest.fn()}
        order={makeOrder({ returnedItems: [] })}
      />,
    );

    expect(screen.queryByText('İade Edildi')).toBeNull();
  });
});
