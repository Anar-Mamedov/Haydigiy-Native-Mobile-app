import { fireEvent, screen } from '@testing-library/react-native';
import { ReturnRejectionSheet } from './return-rejection-sheet';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OrderDetailItem, ReturnRejection } from '@/types/order.types';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'return-rejection-sheet' }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, props);
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

const mockGallery = jest.fn((_props: Record<string, unknown>) => null);

jest.mock('@/features/product/components/product-image-gallery-modal', () => ({
  ProductImageGalleryModal: (props: Record<string, unknown>) => mockGallery(props),
}));

function makeRejection(overrides: Partial<ReturnRejection> = {}): ReturnRejection {
  return {
    caseNo: 'RET-3',
    statusText: 'Kargoya Verildi',
    description: 'Ürün kullanılmış.',
    images: [
      { key: '11', url: 'https://cdn/ret/11.jpg', description: 'Etiket sökülmüş', capturedAt: '03 Nis 2027 - 13:53' },
      { key: '12', url: 'https://cdn/ret/12.jpg', description: null, capturedAt: null },
    ],
    cargoCompany: 'PTT Kargo',
    trackingCode: 'PTT123',
    shipmentOrderNo: 'HG-RET-1',
    shipmentStatusText: 'Kargoda',
    ...overrides,
  };
}

function makeItem(rejection: ReturnRejection | null = makeRejection()): OrderDetailItem {
  return {
    id: 5,
    name: 'İade Ürünü',
    variantName: 'S',
    slug: 'iade-urunu',
    image: null,
    quantity: 1,
    price: 139.99,
    kind: 'returned',
    returnCode: 'HG130626803895',
    returnRequestedAt: '04 Tem 2026 - 23:26',
    returnReceivedAt: '08 Tem 2026 - 10:00',
    returnApprovedAt: null,
    returnStatusName: 'Reddedildi',
    returnRejection: rejection,
  };
}

function renderSheet(item: OrderDetailItem | null = makeItem(), theme: 'light' | 'dark' = 'light') {
  const onOpenChange = jest.fn();
  renderWithTamagui(<ReturnRejectionSheet item={item} onOpenChange={onOpenChange} open />, theme);
  return { onOpenChange };
}

describe('ReturnRejectionSheet', () => {
  beforeEach(() => mockGallery.mockClear());

  it.each(['light', 'dark'] as const)('shows the reason, request info and shipment (%s theme)', (theme) => {
    renderSheet(makeItem(), theme);

    expect(screen.getByText('İade Ret Detayları')).toBeTruthy();
    expect(screen.getByText('İade talebi reddedildi')).toBeTruthy();
    expect(screen.getByText('Ürün kullanılmış.')).toBeTruthy();
    expect(screen.getByText('RET-3')).toBeTruthy();
    expect(screen.getByText('HG130626803895')).toBeTruthy();
    expect(screen.getByText('Kargoya Verildi')).toBeTruthy();
    expect(screen.getByText('08 Tem 2026 - 10:00')).toBeTruthy();
    expect(screen.getByText('PTT Kargo')).toBeTruthy();
    expect(screen.getByText('PTT123')).toBeTruthy();
    expect(screen.getByText('Kargoda')).toBeTruthy();
  });

  // Web `DetailRow` gibi: değeri olmayan satır hiç çizilmez.
  it('skips rows without a value and falls back to the item status', () => {
    renderSheet(makeItem(makeRejection({ statusText: null, caseNo: null })));

    expect(screen.queryByText('Vaka numarası')).toBeNull();
    expect(screen.queryByText('İşlem tarihi')).toBeNull();
    expect(screen.getByText('Reddedildi')).toBeTruthy();
  });

  it('explains missing reason, photos and shipment instead of leaving blanks', () => {
    renderSheet(
      makeItem(
        makeRejection({
          description: null,
          images: [],
          cargoCompany: null,
          trackingCode: null,
          shipmentOrderNo: null,
          shipmentStatusText: null,
        }),
      ),
    );

    expect(screen.getByText('Ret nedeni belirtilmedi.')).toBeTruthy();
    expect(screen.getByText('Bu ret kaydı için görsel eklenmemiş.')).toBeTruthy();
    expect(screen.getByText('Kargo bilgileri henüz oluşmadı. Güncellendiğinde burada gösterilecek.')).toBeTruthy();
  });

  it('opens the full-screen gallery on the tapped photo', () => {
    renderSheet();

    expect(screen.getByText('Etiket sökülmüş')).toBeTruthy();
    expect(screen.getByText('03 Nis 2027 - 13:53')).toBeTruthy();

    fireEvent.press(screen.getByTestId('return-rejection-image-12'));

    expect(mockGallery).toHaveBeenLastCalledWith(
      expect.objectContaining({
        images: ['https://cdn/ret/11.jpg', 'https://cdn/ret/12.jpg'],
        initialIndex: 1,
        open: true,
      }),
    );
  });

  it('closes from the header button', () => {
    const { onOpenChange } = renderSheet();

    fireEvent.press(screen.getByLabelText('İade ret detaylarını kapat'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders no content without a rejected item', () => {
    renderSheet(null);

    expect(screen.queryByText('İade talebi reddedildi')).toBeNull();
  });
});
