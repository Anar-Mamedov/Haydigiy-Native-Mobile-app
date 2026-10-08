import { fireEvent, screen, within } from '@testing-library/react-native';
import { OrderReturnSection } from './order-return-section';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OrderDetail, OrderDetailItem } from '@/types/order.types';

const mockCancelReturn = jest.fn();
let mockCancelingId: number | null = null;

jest.mock('@/components/ui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    AppAlertDialog: ({ open, children }: { open: boolean; children: unknown }) =>
      open ? React.createElement(View, { testID: 'alert-dialog' }, children) : null,
  };
});

jest.mock('../hooks/use-cancel-return-request', () => ({
  useCancelReturnRequest: () => ({
    cancelReturn: mockCancelReturn,
    isCanceling: mockCancelingId !== null,
    cancelingId: mockCancelingId,
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
    returnApprovedAt: null,
    returnRefundAmount: null,
    returnStatusCode: 1,
    returnStatusName: '',
    ...overrides,
  };
}

function makeOrder(returnedItems: OrderDetailItem[]): OrderDetail {
  return {
    returnedItems,
    hasHepsijetReturn: false,
    orderNo: 'HG130626803895',
    id: 1,
  } as OrderDetail;
}

function renderSection(returnedItems: OrderDetailItem[], theme: 'light' | 'dark' = 'light') {
  return renderWithTamagui(
    <OrderReturnSection onPressProduct={jest.fn()} order={makeOrder(returnedItems)} />,
    theme,
  );
}

describe('OrderReturnSection', () => {
  beforeEach(() => {
    mockCancelReturn.mockClear();
    mockCancelingId = null;
  });

  it('shows the web "new returned card": status title, summary, code, dates and chip', () => {
    renderSection([makeReturnedItem()]);

    const card = screen.getByTestId('return-request-card-42');
    expect(within(card).getByText('İade Talebi Oluşturuldu')).toBeTruthy();
    expect(within(card).getByText('1 ürün için iade talebiniz işleme alındı.')).toBeTruthy();
    expect(within(card).getByText('İade kodu: HG130626803895')).toBeTruthy();
    expect(within(card).getByText('Talep Tarihi: 04 Tem 2026 - 23:26')).toBeTruthy();
    expect(within(card).getByText('Kargo Teslim Alma Tarihi: 17 Tem 2026')).toBeTruthy();
    expect(within(card).getByText('İşlem Bekliyor')).toBeTruthy();
    expect(within(card).getByText('İade Beklemede')).toBeTruthy();
    expect(within(card).getByLabelText('İade talebini iptal et')).toBeTruthy();
  });

  it('renders one card per return request, each with its own status bar and code', () => {
    renderSection([
      makeReturnedItem({ id: 5, returnRequestId: 42, returnCode: 'RC-42' }),
      makeReturnedItem({
        id: 6,
        returnRequestId: 43,
        returnCode: 'RC-43',
        returnStatusCode: 4,
        returnStatusName: 'İyi',
      }),
    ]);

    const pending = screen.getByTestId('return-request-card-42');
    const shipped = screen.getByTestId('return-request-card-43');

    expect(within(pending).getByText('İade kodu: RC-42')).toBeTruthy();
    expect(within(shipped).getByText('İade Kargoda')).toBeTruthy();
    expect(within(shipped).getByText('İade kodu: RC-43')).toBeTruthy();
    expect(within(shipped).getByText('İyi')).toBeTruthy();
    // Kargodaki talep artık iptal edilemez; buton yalnızca beklemedeki kartta.
    expect(within(shipped).queryByLabelText('İade talebini iptal et')).toBeNull();
    expect(screen.getAllByTestId('return-status-bar')).toHaveLength(2);
  });

  it('shows received / approval dates and the refund amount once known', () => {
    renderSection([
      makeReturnedItem({
        returnStatusCode: 2,
        returnReceivedAt: '06 Tem 2026 - 10:00',
        returnApprovedAt: '07 Tem 2026 - 11:15',
        returnRefundAmount: 139.99,
      }),
    ]);

    // Hem kart başlığı hem ilerleme çubuğu adımı aynı etiketi taşır.
    expect(screen.getAllByText('İade Onaylandı')).toHaveLength(2);
    expect(screen.getByText('Ürün Ulaşma Tarihi: 06 Tem 2026 - 10:00')).toBeTruthy();
    expect(screen.getByText('Onay Tarihi: 07 Tem 2026 - 11:15')).toBeTruthy();
    expect(screen.getByText('İade Tutarı: 139.99 TL')).toBeTruthy();
  });

  it('merges completed requests into one card without a return code', () => {
    renderSection([
      makeReturnedItem({ id: 5, returnRequestId: 40, returnStatusCode: 7, returnCode: 'RC-40' }),
      makeReturnedItem({ id: 6, returnRequestId: 41, returnStatusCode: 7, returnCode: 'RC-41' }),
    ]);

    const card = screen.getByTestId('return-request-card-completed-returns');
    expect(within(card).getByText('İade Tamamlandı')).toBeTruthy();
    expect(within(card).getByText('2 ürün için iade ödemeniz tamamlandı.')).toBeTruthy();
    expect(within(card).queryByText(/İade kodu:/)).toBeNull();
    expect(screen.getAllByTestId(/^return-request-card-/)).toHaveLength(1);
  });

  it('cancels the request of the card whose button was confirmed', () => {
    renderSection([
      makeReturnedItem({ id: 5, returnRequestId: 42 }),
      makeReturnedItem({ id: 6, returnRequestId: 43 }),
    ]);

    fireEvent.press(
      within(screen.getByTestId('return-request-card-43')).getByLabelText('İade talebini iptal et'),
    );
    expect(screen.getByText('İade talebini iptal etmek istediğinize emin misiniz?')).toBeTruthy();

    fireEvent.press(screen.getByText('Evet, iptal et'));
    expect(mockCancelReturn).toHaveBeenCalledWith(43);
    expect(screen.queryByText('İade talebini iptal etmek istediğinize emin misiniz?')).toBeNull();
  });

  it('shows the in-progress label only on the card being cancelled', () => {
    mockCancelingId = 42;
    renderSection([
      makeReturnedItem({ id: 5, returnRequestId: 42 }),
      makeReturnedItem({ id: 6, returnRequestId: 43 }),
    ]);

    expect(
      within(screen.getByTestId('return-request-card-42')).getByText('İptal ediliyor...'),
    ).toBeTruthy();
    expect(
      within(screen.getByTestId('return-request-card-43')).getByText('İade talebini iptal et'),
    ).toBeTruthy();
  });

  it('keeps titles, codes and the cancel action readable in dark mode', () => {
    renderSection([makeReturnedItem()], 'dark');

    expect(screen.getByText('İade Talebi Oluşturuldu')).toBeTruthy();
    expect(screen.getByText('İade kodu: HG130626803895')).toBeTruthy();
    expect(screen.getByLabelText('İade talebini iptal et')).toBeTruthy();
  });

  it('renders nothing when there are no returned items', () => {
    renderSection([]);

    expect(screen.queryByTestId(/^return-request-card-/)).toBeNull();
  });
});
