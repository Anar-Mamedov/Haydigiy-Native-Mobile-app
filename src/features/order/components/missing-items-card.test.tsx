import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { MissingCase } from '@/types/order.types';
import { MissingItemsCard } from './missing-items-card';

function makeCase(overrides: Partial<MissingCase> = {}): MissingCase {
  return {
    id: 1,
    caseNo: 'EK-1001',
    kind: 'product',
    status: 'open',
    statusLabel: 'Bildirildi',
    resolutionNote: 'Telafi gönderisi hazırlandı.',
    lines: [
      { id: 100, name: 'Elbise', image: null, variantName: 'M', missingQuantity: 2, slug: 'elbise' },
    ],
    delivery: {
      orderId: 991,
      orderNo: 'EK-1001',
      status: 'Kargoda',
      cargoCompanyName: 'Hepsijet',
      trackingCode: 'TRK777',
      itemCount: 1,
    },
    ...overrides,
  };
}

const PART_CASE = makeCase({
  id: 2,
  caseNo: 'EP-2002',
  kind: 'part',
  status: 'resolved',
  statusLabel: 'Çözüldü',
  resolutionNote: 'Parça notu',
  lines: [{ id: 200, name: 'Ceket', image: null, variantName: '', missingQuantity: 1, slug: '' }],
  delivery: null,
});

function renderCard(cases: MissingCase[], theme?: 'light' | 'dark') {
  const onPressProduct = jest.fn();
  const onTrackDelivery = jest.fn();
  renderWithTamagui(
    <MissingItemsCard cases={cases} onPressProduct={onPressProduct} onTrackDelivery={onTrackDelivery} />,
    theme,
  );
  return { onPressProduct, onTrackDelivery };
}

describe('MissingItemsCard', () => {
  it('renders nothing when the order has no reports', () => {
    renderCard([]);

    expect(screen.queryByTestId('missing-items-card')).toBeNull();
  });

  it('renders the summary, both report kinds and their lines', () => {
    renderCard([makeCase(), PART_CASE]);

    expect(screen.getByText('Eksik Ürün Bildirimleri')).toBeTruthy();
    expect(
      screen.getByText('1 bildiriminiz inceleniyor. Toplam 3 adet ürün için kayıt bulunuyor.'),
    ).toBeTruthy();
    expect(screen.getByText('Bildirim: EK-1001')).toBeTruthy();
    expect(screen.getByText('EKSİK ÜRÜN')).toBeTruthy();
    expect(screen.getByText('EKSİK PARÇA')).toBeTruthy();
    expect(screen.getByText('Bildirildi')).toBeTruthy();
    expect(screen.getByText('Çözüldü')).toBeTruthy();
    expect(screen.getByText('Beden: M')).toBeTruthy();
    expect(screen.getByText('Eksik: 2 adet')).toBeTruthy();
  });

  it('shows the resolution note on both missing product and missing part reports', () => {
    renderCard([makeCase(), PART_CASE]);

    expect(screen.getByText('Telafi gönderisi hazırlandı.')).toBeTruthy();
    expect(screen.getByText('Parça notu')).toBeTruthy();
  });

  it('marks a rejected report with its own status badge and shows the rejection note', () => {
    renderCard([
      makeCase({
        status: 'rejected',
        statusLabel: 'Reddedildi',
        resolutionNote: 'Paket eksiksiz teslim edilmiş.',
      }),
      PART_CASE,
    ]);

    expect(screen.getByTestId('missing-case-status-rejected')).toBeTruthy();
    expect(screen.getByTestId('missing-case-status-resolved')).toBeTruthy();
    expect(screen.getByText('Reddedildi')).toBeTruthy();
    expect(screen.getByText('Paket eksiksiz teslim edilmiş.')).toBeTruthy();
  });

  it('opens the product only for lines that resolve to a product', () => {
    const { onPressProduct } = renderCard([makeCase(), PART_CASE]);

    fireEvent.press(screen.getByLabelText('Elbise'));
    fireEvent.press(screen.getByLabelText('Ceket'));

    expect(onPressProduct).toHaveBeenCalledTimes(1);
    expect(onPressProduct).toHaveBeenCalledWith('elbise');
  });

  it('tracks the compensation shipment of a report', () => {
    const { onTrackDelivery } = renderCard([makeCase()]);

    expect(screen.getByText(/Kargoda · Hepsijet/)).toBeTruthy();
    fireEvent.press(screen.getByLabelText('EK-1001 numaralı bildirimin telafi gönderisini takip et'));

    expect(onTrackDelivery).toHaveBeenCalledWith(expect.objectContaining({ orderId: 991 }));
  });

  it('hides tracking while the shipment has no customer tracking code', () => {
    renderCard([
      makeCase({
        delivery: {
          orderId: 991,
          orderNo: 'EK-1001',
          status: 'Hazırlanıyor',
          cargoCompanyName: 'Aras Kargo',
          // Aras'ın geçici iç değeri gerçek takip numarası değildir.
          trackingCode: 'HG123456',
          itemCount: 1,
        },
      }),
    ]);

    expect(screen.getByText(/Hazırlanıyor · Aras Kargo/)).toBeTruthy();
    expect(screen.queryByText('Kargo Takip')).toBeNull();
  });

  it('keeps labels and the tracking action readable in dark theme', () => {
    renderCard(
      [makeCase(), PART_CASE, makeCase({ id: 3, caseNo: 'EK-3003', status: 'rejected', statusLabel: 'Reddedildi' })],
      'dark',
    );

    expect(screen.getByText('Eksik Ürün Bildirimleri')).toBeTruthy();
    expect(screen.getByText('EKSİK PARÇA')).toBeTruthy();
    expect(screen.getByText('Reddedildi')).toBeTruthy();
    expect(screen.getAllByText('Kargo Takip').length).toBeGreaterThan(0);
  });
});
