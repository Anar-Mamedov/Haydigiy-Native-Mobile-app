import { fireEvent } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { BundleItemRow } from './bundle-item-row';
import { BundleItem, BundleVariantOption } from '@/types/bundle.types';

function makeVariant(
  name: string,
  variantId: string,
  stock: number,
  name2: string | null = null,
): BundleVariantOption {
  return { key: `${variantId}-${name}`, variantId, name, name2, stock, hasStock: stock > 0 };
}

function makeItem(overrides: Partial<BundleItem> = {}): BundleItem {
  const variants = overrides.variants ?? [
    makeVariant('S', '3510', 6),
    makeVariant('M', '3511', 2),
    makeVariant('L', '3512', 0),
  ];

  return {
    bundleItemId: 12,
    productId: 525212,
    title: 'Kemer Detaylı Yarım Kol Elbise Siyah',
    slug: 'kemer-detayli-yarim-kol-elbise-siyah',
    imageUrl: 'https://cdn/elbise.webp',
    price: 1250,
    oldPrice: null,
    regularUnitPrice: 1250,
    quantity: 1,
    isAvailable: variants.some((variant) => variant.hasStock),
    ...overrides,
    variants,
  };
}

function renderRow(props: Partial<React.ComponentProps<typeof BundleItemRow>> = {}, theme?: 'light' | 'dark') {
  const onSelectVariant = props.onSelectVariant ?? jest.fn();
  const utils = renderWithTamagui(
    <BundleItemRow
      index={1}
      isMissing={false}
      item={makeItem()}
      onSelectVariant={onSelectVariant}
      {...props}
    />,
    theme,
  );
  return { ...utils, onSelectVariant };
}

describe('BundleItemRow', () => {
  it('shows the item title, price and position in the package', () => {
    const { getByText } = renderRow();

    expect(getByText('Kemer Detaylı Yarım Kol Elbise Siyah')).toBeTruthy();
    expect(getByText('₺1.250,00')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });

  it('compares the single price with the package price, like the web', () => {
    const { getByLabelText, getByText } = renderRow({ item: makeItem({ price: 1199.9, oldPrice: 1250 }) });

    expect(getByText('Tekli alırsan')).toBeTruthy();
    expect(getByText('Pakette alırsan')).toBeTruthy();
    expect(getByText('₺1.250,00')).toHaveStyle({ textDecorationLine: 'line-through' });
    expect(getByText('₺1.199,90')).not.toHaveStyle({ textDecorationLine: 'line-through' });
    expect(getByLabelText('Tekli alırsan ₺1.250,00, pakette alırsan ₺1.199,90')).toBeTruthy();
  });

  it('tells how much buying the item in the package saves', () => {
    const { getByText } = renderRow({ item: makeItem({ price: 1199.9, oldPrice: 1250 }) });

    expect(getByText('Ürünü pakette alırsan ₺50,10 indirim kazanırsın.')).toBeTruthy();
  });

  it('does not multiply the saving by the quantity again (prices are line totals)', () => {
    // 2 adet: satır fiyatları 2 × 1.199,95 ve 2 × 1.250; kazanç 100,10 (200,20 değil).
    const { getByText } = renderRow({ item: makeItem({ price: 2399.9, oldPrice: 2500, quantity: 2 }) });

    expect(getByText('Ürünü pakette alırsan ₺100,10 indirim kazanırsın.')).toBeTruthy();
  });

  it('promises no saving when the single price is not higher', () => {
    const { queryByText } = renderRow();

    expect(queryByText(/pakette alırsan .* kazanırsın/)).toBeNull();
  });

  it('shows only the package price when the item has no package discount', () => {
    const { getByLabelText, getByText } = renderRow();

    expect(getByText('₺1.250,00')).not.toHaveStyle({ textDecorationLine: 'line-through' });
    expect(getByLabelText('Paket içi fiyatı ₺1.250,00')).toBeTruthy();
  });

  it('shows no price when the item has no price', () => {
    const { queryByLabelText } = renderRow({ item: makeItem({ price: 0, oldPrice: 1250 }) });

    expect(queryByLabelText(/Paket içi fiyatı/)).toBeNull();
  });

  it('keeps both prices readable in the dark theme', () => {
    const { getByText } = renderRow({ item: makeItem({ price: 1199.9, oldPrice: 1250 }) }, 'dark');

    expect(getByText('₺1.250,00')).toBeTruthy();
    expect(getByText('₺1.199,90')).toBeTruthy();
  });

  it('sends the product-specific variant id when a size is picked', () => {
    const { getByLabelText, onSelectVariant } = renderRow();

    fireEvent.press(getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah için beden M'));

    // Seçim `product_variant_id` ile gönderilir; bedenin global `variant_id`'si değil.
    expect(onSelectVariant).toHaveBeenCalledWith(12, '3511');
  });

  it('does not select a sold-out size', () => {
    const { getByLabelText, onSelectVariant } = renderRow();

    fireEvent.press(getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah için beden L, tükendi'));

    expect(onSelectVariant).not.toHaveBeenCalled();
  });

  it('prompts for a size while none is selected', () => {
    const { getByText } = renderRow();

    expect(getByText('Beden seçiniz')).toBeTruthy();
  });

  it('confirms the selected size', () => {
    const { getByText, queryByText } = renderRow({ selectedVariantId: '3510' });

    expect(getByText('S bedeni seçildi')).toBeTruthy();
    expect(queryByText('Beden seçiniz')).toBeNull();
  });

  it('warns when the selected size is running low', () => {
    const { getByText } = renderRow({ selectedVariantId: '3511' });

    expect(getByText('Son 2 ürün!')).toBeTruthy();
  });

  it('does not warn when the selected size has plenty of stock', () => {
    const { queryByText } = renderRow({ selectedVariantId: '3510' });

    expect(queryByText(/Son \d+ ürün!/)).toBeNull();
  });

  it('marks the row as sold out when no size has stock', () => {
    const item = makeItem({ variants: [makeVariant('S', '3510', 0), makeVariant('M', '3511', 0)] });
    const { getByText, queryByText } = renderRow({ item });

    expect(getByText('Bu ürün tükendi')).toBeTruthy();
    expect(queryByText('Beden seçiniz')).toBeNull();
  });

  it('states when the package carries more than one of the item', () => {
    const { getByText } = renderRow({ item: makeItem({ quantity: 2 }) });

    expect(getByText('Pakette 2 adet')).toBeTruthy();
  });

  it('falls back to a notice when the item has no sizes at all', () => {
    const { getByText } = renderRow({ item: makeItem({ variants: [] }) });

    expect(getByText('Beden bilgisi bulunamadı')).toBeTruthy();
  });

  it('renders the size label together with its secondary name', () => {
    const item = makeItem({ variants: [makeVariant('S', '3510', 4, '36')] });
    const { getByText } = renderRow({ item });

    expect(getByText('S (36)')).toBeTruthy();
  });

  it('keeps the missing-selection prompt readable in the dark theme', () => {
    const { getByText } = renderRow({ isMissing: true }, 'dark');

    expect(getByText('Beden seçiniz')).toBeTruthy();
    expect(getByText('Kemer Detaylı Yarım Kol Elbise Siyah')).toBeTruthy();
  });

  it('opens the product from the image', () => {
    const onOpenProduct = jest.fn();
    const item = makeItem();
    const { getByLabelText } = renderRow({ item, onOpenProduct });

    fireEvent.press(getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah ürün detayı'));

    expect(onOpenProduct).toHaveBeenCalledWith(item);
  });

  it('hands the item to Tekli Satın Al whether or not a size is picked', () => {
    // Beden seçiliyse sepete ekleme, değilse ürün detayı kararı çağırana (controller) aittir.
    const onBuySingle = jest.fn();
    const item = makeItem();
    const { getByLabelText } = renderRow({ item, onBuySingle });

    fireEvent.press(getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah, Tekli Satın Al'));

    expect(onBuySingle).toHaveBeenCalledWith(item);
  });

  it('switches the button to Tekli Sepete Ekle once a size is picked, like the web', () => {
    const onBuySingle = jest.fn();
    const item = makeItem();
    const { getByLabelText, getByText, queryByText } = renderRow({ item, onBuySingle, selectedVariantId: '3510' });

    expect(getByText('Tekli Sepete Ekle')).toBeTruthy();
    expect(queryByText('Tekli Satın Al')).toBeNull();

    fireEvent.press(getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah, Tekli Sepete Ekle'));

    expect(onBuySingle).toHaveBeenCalledWith(item);
  });

  it('confirms on the button that the item was just added', () => {
    const { getByText, queryByText } = renderRow({
      isAddedSingle: true,
      onBuySingle: jest.fn(),
      selectedVariantId: '3510',
    });

    expect(getByText('Tekli Ürün Eklendi')).toBeTruthy();
    expect(queryByText('Tekli Sepete Ekle')).toBeNull();
  });

  it('offers Tekli Sepete Ekle without a product page once a size is picked', () => {
    const { getByText } = renderRow({
      item: makeItem({ slug: null }),
      onBuySingle: jest.fn(),
      selectedVariantId: '3510',
    });

    expect(getByText('Tekli Sepete Ekle')).toBeTruthy();
  });

  it('greys out Tekli Satın Al when the item has neither a size nor a product page', () => {
    const onBuySingle = jest.fn();
    const { getByLabelText, queryByLabelText } = renderRow({
      item: makeItem({ slug: null }),
      onBuySingle,
      onOpenProduct: jest.fn(),
    });

    // Webdeki gibi buton görünür ama pasiftir; görsel de gidilecek sayfa olmadığı için tıklanmaz.
    const button = getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah, Tekli Satın Al');
    expect(button).toBeDisabled();
    fireEvent.press(button);
    expect(onBuySingle).not.toHaveBeenCalled();
    expect(queryByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah ürün detayı')).toBeNull();
  });

  it('greys out Tekli Satın Al for a sold-out item', () => {
    const onBuySingle = jest.fn();
    const item = makeItem({ variants: [makeVariant('S', '3510', 0), makeVariant('M', '3511', 0)] });
    const { getByLabelText } = renderRow({ item, onBuySingle });

    const button = getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah, Tekli Satın Al');
    expect(button).toBeDisabled();
    fireEvent.press(button);
    expect(onBuySingle).not.toHaveBeenCalled();
  });

  it('offers no actions when the caller does not handle them', () => {
    const { queryByLabelText, queryByText } = renderRow();

    expect(queryByText('Tekli Satın Al')).toBeNull();
    expect(queryByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah ürün detayı')).toBeNull();
  });

  it('shows the adding state and ignores presses while the item is being bought', () => {
    const onBuySingle = jest.fn();
    const { getByLabelText, getByTestId, queryByText } = renderRow({
      isBuyingSingle: true,
      onBuySingle,
      selectedVariantId: '3510',
    });

    expect(getByTestId('bundle-buy-single-spinner')).toBeTruthy();
    expect(queryByText('Tekli Sepete Ekle')).toBeNull();

    fireEvent.press(getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah, Ekleniyor'));

    expect(onBuySingle).not.toHaveBeenCalled();
  });

  it('keeps the Tekli Satın Al label and the price comparison readable in the dark theme', () => {
    const { getByText } = renderRow({ item: makeItem({ price: 1199.9, oldPrice: 1250 }), onBuySingle: jest.fn() }, 'dark');

    expect(getByText('Tekli Satın Al')).toBeTruthy();
    expect(getByText('Tekli alırsan')).toBeTruthy();
    expect(getByText('Pakette alırsan')).toBeTruthy();
    expect(getByText('Ürünü pakette alırsan ₺50,10 indirim kazanırsın.')).toBeTruthy();
  });
});
