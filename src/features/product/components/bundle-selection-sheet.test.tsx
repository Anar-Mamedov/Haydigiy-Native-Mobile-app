import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { BundleSelectionSheet } from './bundle-selection-sheet';
import { BundleItem, BundleSummary } from '@/types/bundle.types';

// Tamagui `Sheet` portala render eder; test ortamında içeriği doğrudan basmak için
// diğer sheet testleriyle aynı hafif mock kullanılır.
jest.mock('tamagui', () => {
  const actual = jest.requireActual('tamagui');
  const React = jest.requireActual('react');

  const SheetRoot = function SheetRoot({ children, open }: any) {
    return open ? React.createElement(React.Fragment, null, children) : null;
  };
  SheetRoot.Overlay = function SheetOverlay() {
    return null;
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(actual.YStack, props, children);
  };

  return { ...actual, Sheet: SheetRoot };
});

function makeItem(bundleItemId: number, title: string, sizes: { name: string; id: string; stock: number }[]): BundleItem {
  const variants = sizes.map((size, index) => ({
    key: `${size.id}-${index}`,
    variantId: size.id,
    name: size.name,
    name2: null,
    stock: size.stock,
    hasStock: size.stock > 0,
  }));

  return {
    bundleItemId,
    productId: bundleItemId * 10,
    title,
    slug: null,
    imageUrl: '',
    price: 1250,
    oldPrice: null,
    quantity: 1,
    isAvailable: variants.some((variant) => variant.hasStock),
    variants,
  };
}

const ITEMS = [
  makeItem(12, 'Kemer Detaylı Elbise', [
    { name: 'S', id: '3510', stock: 5 },
    { name: 'M', id: '3511', stock: 4 },
  ]),
  makeItem(13, 'Kruvaze Ceket', [
    { name: 'S', id: '3577', stock: 2 },
    { name: 'M', id: '3578', stock: 3 },
  ]),
];

function makeSummary(overrides: Partial<BundleSummary> = {}): BundleSummary {
  return {
    itemCount: 2,
    itemsTotal: 2500,
    bundlePrice: 2000,
    savings: 500,
    savingsPercent: 20,
    isSellable: true,
    maxQuantity: 10,
    ...overrides,
  };
}

function renderSheet(
  overrides: Partial<React.ComponentProps<typeof BundleSelectionSheet>> = {},
  theme?: 'light' | 'dark',
) {
  const onConfirm = overrides.onConfirm ?? jest.fn();
  const onClose = overrides.onClose ?? jest.fn();
  const onSelectVariant = overrides.onSelectVariant ?? jest.fn();

  const utils = renderWithTamagui(
    <BundleSelectionSheet
      imageUrl="https://cdn/bundle.webp"
      isComplete={false}
      isPurchasable
      items={ITEMS}
      missingHighlight={false}
      missingItemIds={[12, 13]}
      open
      productName="Deneme bundle"
      selectedCount={0}
      selections={{}}
      summary={makeSummary()}
      {...overrides}
      onClose={onClose}
      onConfirm={onConfirm}
      onSelectVariant={onSelectVariant}
    />,
    theme,
  );

  return { ...utils, onConfirm, onClose, onSelectVariant };
}

describe('BundleSelectionSheet', () => {
  it('renders nothing while closed', () => {
    renderSheet({ open: false });

    expect(screen.queryByText('Paket İçeriği')).toBeNull();
  });

  it('lists every product in the package with its own size strip', () => {
    renderSheet();

    expect(screen.getByText('Deneme bundle')).toBeTruthy();
    expect(screen.getByText('2 ürün')).toBeTruthy();
    expect(screen.getByText('Kemer Detaylı Elbise')).toBeTruthy();
    expect(screen.getByText('Kruvaze Ceket')).toBeTruthy();
    expect(screen.getByLabelText('Kemer Detaylı Elbise için beden S')).toBeTruthy();
    expect(screen.getByLabelText('Kruvaze Ceket için beden M')).toBeTruthy();
  });

  it('reports the selection progress', () => {
    renderSheet({ selectedCount: 1, selections: { 12: '3510' }, missingItemIds: [13] });

    expect(screen.getByText('1/2 beden seçildi')).toBeTruthy();
    expect(screen.getByText('Sepete eklemek için paketteki her ürün için beden seçin.')).toBeTruthy();
  });

  it('asks for the remaining sizes on the action button until every item has one', () => {
    renderSheet({ selectedCount: 1, selections: { 12: '3510' }, missingItemIds: [13] });

    expect(screen.getByText('1 ürün için beden seçin')).toBeTruthy();
  });

  it('offers the add-to-cart action once all sizes are picked', () => {
    renderSheet({
      isComplete: true,
      missingItemIds: [],
      selectedCount: 2,
      selections: { 12: '3510', 13: '3578' },
    });

    expect(screen.getByText('Paketi Sepete Ekle')).toBeTruthy();
    expect(screen.getByText('Tüm bedenler seçildi, paketi sepete ekleyebilirsiniz.')).toBeTruthy();
  });

  it('bubbles up the size choice with its bundle item id', () => {
    const { onSelectVariant } = renderSheet();

    fireEvent.press(screen.getByLabelText('Kruvaze Ceket için beden S'));

    expect(onSelectVariant).toHaveBeenCalledWith(13, '3577');
  });

  it('still calls onConfirm with sizes missing so the caller can highlight them', () => {
    const { onConfirm } = renderSheet();

    fireEvent.press(screen.getByTestId('bundle-add-to-cart'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows the package price and the saving', () => {
    renderSheet();

    expect(screen.getByText('₺2.000,00')).toBeTruthy();
    expect(screen.getByText('Pakette kazanç:')).toBeTruthy();
    expect(screen.getByText('₺500,00')).toBeTruthy();
    expect(screen.getByTestId('bundle-summary-discount-badge')).toBeTruthy();
    expect(screen.getByText('%20')).toBeTruthy();
  });

  describe('satışa kapalı paket', () => {
    const closedProps = { summary: makeSummary({ isSellable: false }) };

    it('says the package is closed for sale instead of inviting a purchase', () => {
      renderSheet({
        ...closedProps,
        isComplete: true,
        missingItemIds: [],
        selectedCount: 2,
        selections: { 12: '3510', 13: '3578' },
      });

      // Buton "SATIŞA KAPALI" derken yardım metni "sepete ekleyebilirsiniz" DEMEZ.
      expect(screen.getByText('Satışa Kapalı')).toBeTruthy();
      expect(screen.getByText('Bu paket şu an satışa kapalı.')).toBeTruthy();
      expect(screen.queryByText('Tüm bedenler seçildi, paketi sepete ekleyebilirsiniz.')).toBeNull();
      expect(screen.getByText('Ürün şu an satışa kapalıdır, daha sonra tekrar deneyiniz.')).toBeTruthy();
    });

    it('disables the add-to-cart action', () => {
      renderSheet(closedProps);

      expect(screen.getByLabelText('Satışa Kapalı')).toBeDisabled();
    });
  });

  it('blocks confirmation when a product inside the package is out of stock', () => {
    renderSheet({ isPurchasable: false });

    expect(screen.getByText('Paket Tükendi')).toBeTruthy();
    expect(screen.getByLabelText('Paket Tükendi')).toBeDisabled();
  });

  it('blocks a second submit while the package is being added', () => {
    renderSheet({ isAdding: true, isComplete: true, missingItemIds: [] });

    expect(screen.getByText('Ekleniyor...')).toBeTruthy();
    expect(screen.getByLabelText('Ekleniyor...')).toBeDisabled();
  });

  it('surfaces the failure instead of closing silently', () => {
    renderSheet({ errorMessage: 'Paket sepete eklenemedi. Lütfen tekrar deneyin.' });

    expect(screen.getByText('Paket sepete eklenemedi. Lütfen tekrar deneyin.')).toBeTruthy();
  });

  it('shows no error box when nothing failed', () => {
    renderSheet();

    expect(screen.queryByText(/eklenemedi/)).toBeNull();
  });

  it('closes on cancel', () => {
    const { onClose } = renderSheet();

    fireEvent.press(screen.getByText('Vazgeç'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the shipping note when the backend sends one', () => {
    renderSheet({ shippingMessage: 'Kargoya verilme süresi 3 gündür.' });

    expect(screen.getByText('Kargoya verilme süresi 3 gündür.')).toBeTruthy();
  });

  it('stays readable in the dark theme', () => {
    renderSheet({ errorMessage: 'Paket sepete eklenemedi.' }, 'dark');

    expect(screen.getByText('Paket İçeriği')).toBeTruthy();
    expect(screen.getByText('Paket sepete eklenemedi.')).toBeTruthy();
    expect(screen.getByText('PAKET ÜRÜN')).toBeTruthy();
  });
});

describe('BundleSelectionSheet — erişilebilirlik', () => {
  it('announces the add-to-cart failure to screen readers', () => {
    renderSheet({ errorMessage: 'Paket sepete eklenemedi.' });

    const alert = screen.getByRole('alert');

    expect(alert).toBeTruthy();
    expect(alert.props.accessibilityLiveRegion).toBe('polite');
  });

  it('labels the action button with what it will do', () => {
    renderSheet({ isComplete: true, missingItemIds: [], selectedCount: 2 });

    expect(screen.getByLabelText('Paketi Sepete Ekle')).toBeTruthy();
  });
});
