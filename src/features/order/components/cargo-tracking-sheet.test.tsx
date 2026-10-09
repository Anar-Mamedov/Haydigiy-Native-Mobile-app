import { fireEvent, screen } from '@testing-library/react-native';
import { CargoTrackingSheet } from './cargo-tracking-sheet';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CargoShipment, OrderAddress, OrderCargoTracking } from '@/types/order.types';

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

const SHIPPING_ADDRESS: OrderAddress = {
  name: 'Anar',
  surname: 'Mammadov',
  phone: '0507654321',
  email: null,
  addressLine: 'Adres satırı',
  neighbourhood: 'Mahalle',
  district: 'İlçe',
  city: 'İstanbul',
  zipCode: null,
};

function makeShipment(overrides: Partial<CargoShipment> = {}): CargoShipment {
  return {
    orderId: '12',
    orderNo: 'HG123',
    trackingCode: 'TRK12345678',
    cargoCompanyName: 'Hepsijet',
    cargoCompanyLogo: null,
    itemCount: 1,
    ...overrides,
  };
}

function renderSheet(shipment: CargoShipment = makeShipment()) {
  return renderWithTamagui(
    <CargoTrackingSheet
      onOpenChange={jest.fn()}
      open
      shipment={shipment}
      shippingAddress={SHIPPING_ADDRESS}
    />,
  );
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
    renderSheet();

    expect(mockUseOrderCargoTrackingQuery).toHaveBeenCalledWith('12', true);
    expect(screen.getByText('Kargo Takibi')).toBeTruthy();
    expect(screen.getByText('TRK1 2345 678')).toBeTruthy();
    expect(screen.getByText('Kurye Dağıtımda')).toBeTruthy();
    expect(screen.getByText('Adres satırı, Mahalle, İlçe, İstanbul')).toBeTruthy();
    expect(screen.getByText('Dağıtıma çıktı')).toBeTruthy();
  });

  it('collapses and expands detailed cargo movements', () => {
    renderSheet();

    fireEvent.press(screen.getByTestId('cargo-tracking-movements-toggle'));

    expect(screen.queryByText('Dağıtıma çıktı')).toBeNull();
    expect(screen.getByText('Göster')).toBeTruthy();
  });

  it('tracks a compensation shipment by its own order id and item count', () => {
    mockUseOrderCargoTrackingQuery.mockReturnValue({
      data: { ...makeTracking(), orderNo: null, trackingCode: null },
      error: null,
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    });

    renderSheet(makeShipment({ orderId: '991', orderNo: 'EK-1001', trackingCode: 'TELAFI0001', itemCount: 2 }));

    expect(mockUseOrderCargoTrackingQuery).toHaveBeenCalledWith('991', true);
    // Takip yanıtında numara yoksa gönderinin kendi numarasına düşülür.
    expect(screen.getByText('TELA FI00 01')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });
});
