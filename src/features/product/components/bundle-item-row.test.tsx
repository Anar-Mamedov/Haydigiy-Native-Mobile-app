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

  it('labels the price as what Tek Satın Al puts in the cart', () => {
    const { getByText } = renderRow();

    expect(getByText('Tek alım fiyatı')).toBeTruthy();
  });

  it('shows no price label when the item has no price', () => {
    const { queryByText } = renderRow({ item: makeItem({ price: 0 }) });

    expect(queryByText('Tek alım fiyatı')).toBeNull();
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

  it('hands the item to Tek Satın Al whether or not a size is picked', () => {
    // Beden seçiliyse sepete ekleme, değilse ürün detayı kararı çağırana (controller) aittir.
    const onBuySingle = jest.fn();
    const item = makeItem();
    const { getByLabelText } = renderRow({ item, onBuySingle });

    fireEvent.press(getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah tek satın al'));

    expect(onBuySingle).toHaveBeenCalledWith(item);
  });

  it('offers Tek Satın Al without a product page once a size is picked', () => {
    const { getByText } = renderRow({
      item: makeItem({ slug: null }),
      onBuySingle: jest.fn(),
      selectedVariantId: '3510',
    });

    expect(getByText('Tek Satın Al')).toBeTruthy();
  });

  it('offers nothing to open or buy when the item has neither a size nor a product page', () => {
    const { queryByLabelText, queryByText } = renderRow({
      item: makeItem({ slug: null }),
      onBuySingle: jest.fn(),
      onOpenProduct: jest.fn(),
    });

    expect(queryByText('Tek Satın Al')).toBeNull();
    expect(queryByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah ürün detayı')).toBeNull();
  });

  it('does not offer Tek Satın Al for a sold-out item', () => {
    const item = makeItem({ variants: [makeVariant('S', '3510', 0), makeVariant('M', '3511', 0)] });
    const { queryByText } = renderRow({ item, onBuySingle: jest.fn() });

    expect(queryByText('Tek Satın Al')).toBeNull();
  });

  it('offers no actions when the caller does not handle them', () => {
    const { queryByLabelText, queryByText } = renderRow();

    expect(queryByText('Tek Satın Al')).toBeNull();
    expect(queryByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah ürün detayı')).toBeNull();
  });

  it('shows the adding state and ignores presses while the item is being bought', () => {
    const onBuySingle = jest.fn();
    const { getByLabelText, getByText, queryByText } = renderRow({
      isBuyingSingle: true,
      onBuySingle,
      selectedVariantId: '3510',
    });

    expect(getByText('Ekleniyor...')).toBeTruthy();
    expect(queryByText('Tek Satın Al')).toBeNull();

    fireEvent.press(getByLabelText('Kemer Detaylı Yarım Kol Elbise Siyah tek satın al'));

    expect(onBuySingle).not.toHaveBeenCalled();
  });

  it('keeps the Tek Satın Al label readable in the dark theme', () => {
    const { getByText } = renderRow({ onBuySingle: jest.fn() }, 'dark');

    expect(getByText('Tek Satın Al')).toBeTruthy();
  });
});
