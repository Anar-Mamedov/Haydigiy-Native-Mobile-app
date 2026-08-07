import { fireEvent, screen } from '@testing-library/react-native';
import { CargoTrackingSheet } from './cargo-tracking-sheet';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OrderCargoTracking, OrderDetail } from '@/types/order.types';

const mockUseOrderCargoTrackingQuery = jest.fn();

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: props.testID ?? 'cargo-tracking-sheet', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, { testID: 'cargo-tracking-sheet-overlay', ...props });
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, { testID: 'cargo-tracking-sheet-frame', ...props }, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

jest.mock('../api/order.queries', () => ({
  useOrderCargoTrackingQuery: (...args: unknown[]) => mockUseOrderCargoTrackingQuery(...args),
}));

function makeOrder(overrides: Partial<OrderDetail> = {}): OrderDetail {
  return {
    id: 12,
    orderNo: 'HG123',
    createdAt: '2026-07-06',
    deliveredAt: '',
    status: 'Kargoda',
    statusId: 6,
    trackingCode: 'TRK12345678',
    cargoCompanyName: 'Hepsijet',
    cargoCompanyLogo: null,
    invoicePdfUrl: null,
    paymentMethodId: 1,
    canCreateReturnRequest: false,
    returnBlockReason: null,
    returnDeadline: null,
    returnRequestIds: [],
    cancellableReturnRequestId: null,
    hasHepsijetReturn: false,
    returnPaymentInfo: null,
    shippingAddress: {
      name: 'Anar',
      surname: 'Mammadov',
      phone: '0507654321',
      email: null,
      addressLine: 'Adres satırı',
      neighbourhood: 'Mahalle',
      district: 'İlçe',
      city: 'İstanbul',
      zipCode: null,
    },
    billingAddress: null,
    billingType: 'individual',
    tcNumber: null,
    taxNumber: null,
    taxOffice: null,
    items: [
      {
        id: 1,
        image: null,
        kind: 'normal',
        name: 'Ürün',
        price: 100,
        quantity: 1,
        slug: 'urun',
        variantName: 'M',
      },
    ],
    returnedItems: [],
    cancelledItems: [],
    totals: {
      subtotal: 0,
      userDiscount: 0,
      couponDiscount: 0,
      couponCode: null,
      campaignDiscount: 0,
      cargoFee: 0,
      codFee: 0,
      paymentFee: 0,
      returnTotal: 0,
      total: 0,
      paymentMethod: '',
      installmentCount: null,
      interestAmount: 0,
      totalWithInterest: 0,
      hasInstallmentInfo: false,
      payableTotal: 0,
    },
    totalItemsQty: 1,
    returnedQty: 0,
    cancelledQty: 0,
    isFullyCancelled: false,
    ...overrides,
  };
}

function makeTracking(): OrderCargoTracking {
  return {
    orderNo: 'HG123',
    trackingCode: 'TRK12345678',
    statusName: 'Kargoda',
    cargoCompanyName: 'Hepsijet',
    cargoStatus: null,
    delivered: false,
    lastMovement: {
      id: 1,
      code: 'DELIVERING',
      dateLabel: '06.07.2026 13:20',
      delivered: false,
      description: 'Dağıtıma çıktı',
      location: 'İstanbul Transfer',
      stageKey: 'courier',
    },
    movements: [
      {
        id: 1,
        code: 'DELIVERING',
        dateLabel: '06.07.2026 13:20',
        delivered: false,
        description: 'Dağıtıma çıktı',
        location: 'İstanbul Transfer',
        stageKey: 'courier',
      },
    ],
    stages: [
      { key: 'handed', label: 'Kargoya Verildi', completed: true },
      { key: 'transfer', label: 'Transfer sürecinde', completed: true },
      { key: 'branch', label: 'Teslimat Şubesinde', completed: true },
      { key: 'courier', label: 'Kurye Dağıtımda', completed: true },
      { key: 'done', label: 'Tamamlandı', completed: false },
    ],
  };
}

describe('CargoTrackingSheet', () => {
  beforeEach(() => {
    mockUseOrderCargoTrackingQuery.mockReturnValue({
      data: makeTracking(),
      error: null,
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads tracking only when open and renders the tracking details', () => {
    renderWithTamagui(<CargoTrackingSheet onOpenChange={jest.fn()} open order={makeOrder()} />);

    expect(mockUseOrderCargoTrackingQuery).toHaveBeenCalledWith('12', true);
    expect(screen.getByText('Kargo Takibi')).toBeTruthy();
    expect(screen.getByText('TRK1 2345 678')).toBeTruthy();
    expect(screen.getByText('Kurye Dağıtımda')).toBeTruthy();
    expect(screen.getByText('Adres satırı, Mahalle, İlçe, İstanbul')).toBeTruthy();
    expect(screen.getByText('Dağıtıma çıktı')).toBeTruthy();
  });

  it('collapses and expands detailed cargo movements', () => {
    renderWithTamagui(<CargoTrackingSheet onOpenChange={jest.fn()} open order={makeOrder()} />);

    fireEvent.press(screen.getByTestId('cargo-tracking-movements-toggle'));

    expect(screen.queryByText('Dağıtıma çıktı')).toBeNull();
    expect(screen.getByText('Göster')).toBeTruthy();
  });
});
