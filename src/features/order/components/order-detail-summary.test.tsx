import { fireEvent, screen } from '@testing-library/react-native';
import { OrderDetailSummary } from './order-detail-summary';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OrderDetail } from '@/types/order.types';
import { CARGO_TRACKING_PENDING_MESSAGE } from '../utils/cargo-tracking';

jest.mock('@/components/ui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  return {
    SectionCard: ({ children, ...props }: any) => React.createElement(View, props, children),
  };
});

function makeOrder(overrides: Partial<OrderDetail> = {}): OrderDetail {
  return {
    id: 12,
    orderNo: 'HG123',
    createdAt: '2026-07-06',
    deliveredAt: '',
    status: 'Kargoda',
    statusColor: '#2563eb',
    statusId: 6,
    trackingCode: 'TRK123',
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
    shippingAddress: null,
    billingAddress: null,
    billingType: 'individual',
    tcNumber: null,
    taxNumber: null,
    taxOffice: null,
    items: [],
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
    totalItemsQty: 0,
    returnedQty: 0,
    cancelledQty: 0,
    isFullyCancelled: false,
    ...overrides,
  };
}

describe('OrderDetailSummary', () => {
  it('shows the cargo tracking action when the order has a tracking code', () => {
    const onPressCargoTracking = jest.fn();
    renderWithTamagui(
      <OrderDetailSummary order={makeOrder()} onPressCargoTracking={onPressCargoTracking} />,
    );

    fireEvent.press(screen.getByLabelText('Kargo Takip'));

    expect(screen.getByText('Hepsijet')).toBeTruthy();
    expect(screen.getByText('TRK123')).toBeTruthy();
    expect(onPressCargoTracking).toHaveBeenCalledTimes(1);
  });

  it('shows the selected cargo company before a tracking code is assigned', () => {
    renderWithTamagui(
      <OrderDetailSummary
        order={makeOrder({
          status: 'Onaylandı',
          statusId: 3,
          trackingCode: null,
          cargoCompanyName: 'Aras Kargo',
        })}
        onPressCargoTracking={jest.fn()}
      />,
    );

    expect(screen.getByText('Kargo Firması:')).toBeTruthy();
    expect(screen.getByText('Aras Kargo')).toBeTruthy();
    expect(screen.getByText(CARGO_TRACKING_PENDING_MESSAGE)).toBeTruthy();
    expect(screen.queryByLabelText('Kargo Takip')).toBeNull();
  });

  // Kargo firması gerçek numarayı üretene kadar takip alanında siparişin kendi numarası
  // duruyor; bu geçici değer müşteriye gösterilmemeli.
  it('hides the internal placeholder tracking code and the tracking action', () => {
    renderWithTamagui(
      <OrderDetailSummary
        order={makeOrder({
          orderNo: 'HG0608261190940',
          trackingCode: 'HG0608261190940',
          cargoCompanyName: 'Aras Kargo',
        })}
        onPressCargoTracking={jest.fn()}
      />,
    );

    expect(screen.queryByText('HG0608261190940', { exact: true })).toBeNull();
    expect(screen.getByText(CARGO_TRACKING_PENDING_MESSAGE)).toBeTruthy();
    expect(screen.queryByLabelText('Kargo Takip')).toBeNull();
  });

  // Kural yalnızca Aras entegrasyonuna ait; kapsayıcının firma adını gerçekten
  // geçirdiğini burada doğruluyoruz (util testleri bu bağlantıyı görmez).
  it('shows another carrier\'s code even when it looks like the placeholder', () => {
    renderWithTamagui(
      <OrderDetailSummary
        order={makeOrder({
          cargoCompanyName: 'Hepsijet',
          orderNo: 'HG0608261190940',
          trackingCode: 'HG0608261190940',
        })}
        onPressCargoTracking={jest.fn()}
      />,
    );

    expect(screen.getByText('HG0608261190940')).toBeTruthy();
    expect(screen.getByLabelText('Kargo Takip')).toBeTruthy();
    expect(screen.queryByText(CARGO_TRACKING_PENDING_MESSAGE)).toBeNull();
  });

  it('hides the cargo tracking action for cancelled orders', () => {
    renderWithTamagui(
      <OrderDetailSummary order={makeOrder({ statusId: 4 })} onPressCargoTracking={jest.fn()} />,
    );

    expect(screen.queryByLabelText('Kargo Takip')).toBeNull();
  });
});
