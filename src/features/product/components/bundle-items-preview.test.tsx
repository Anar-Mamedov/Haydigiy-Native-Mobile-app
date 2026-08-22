import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { BundleItemsPreview } from './bundle-items-preview';
import { BundleItem, BundleSummary } from '@/types/bundle.types';

function makeItem(bundleItemId: number, title: string): BundleItem {
  return {
    bundleItemId,
    productId: bundleItemId * 10,
    title,
    slug: null,
    imageUrl: `https://cdn/${bundleItemId}.webp`,
    price: 1250,
    oldPrice: null,
    quantity: 1,
    isAvailable: true,
    variants: [
      { key: `${bundleItemId}-s`, variantId: `${bundleItemId}1`, name: 'S', name2: null, stock: 4, hasStock: true },
    ],
  };
}

const ITEMS = [makeItem(12, 'Kemer Detaylı Elbise'), makeItem(13, 'Kruvaze Ceket')];

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

function renderPreview(
  overrides: Partial<React.ComponentProps<typeof BundleItemsPreview>> = {},
  theme?: 'light' | 'dark',
) {
  const onPress = overrides.onPress ?? jest.fn();
  const utils = renderWithTamagui(
    <BundleItemsPreview
      items={ITEMS}
      selectedCount={0}
      summary={makeSummary()}
      {...overrides}
      onPress={onPress}
    />,
    theme,
  );
  return { ...utils, onPress };
}

describe('BundleItemsPreview', () => {
  it('renders nothing for an empty package', () => {
    const { toJSON } = renderPreview({ items: [] });

    expect(toJSON()).toBeNull();
  });

  it('states how many products the package holds', () => {
    renderPreview();

    expect(screen.getByText('Bu paket 2 üründen oluşuyor')).toBeTruthy();
    expect(screen.getByLabelText('Paket içeriği, 2 ürün')).toBeTruthy();
  });

  it('invites the shopper to pick the remaining sizes', () => {
    renderPreview({ selectedCount: 1 });

    expect(screen.getByText('Bedenleri seç (1/2)')).toBeTruthy();
  });

  it('confirms once every size is chosen', () => {
    renderPreview({ selectedCount: 2 });

    expect(screen.getByText('Bedenler seçildi — sepete ekleyebilirsiniz')).toBeTruthy();
  });

  it('never promises a purchase while the package is closed for sale', () => {
    renderPreview({ selectedCount: 2, summary: makeSummary({ isSellable: false }) });

    expect(screen.getByText('Bu paket şu an satışa kapalı')).toBeTruthy();
    expect(screen.queryByText('Bedenler seçildi — sepete ekleyebilirsiniz')).toBeNull();
  });

  it('shows the saving the package provides', () => {
    renderPreview();

    expect(screen.getByText('Pakette ₺500,00 kazanç')).toBeTruthy();
  });

  it('promises no saving when the package is not cheaper', () => {
    renderPreview({ summary: makeSummary({ savings: 0, savingsPercent: 0, bundlePrice: 2500 }) });

    expect(screen.queryByText(/kazanç/)).toBeNull();
  });

  it('opens the size sheet when tapped', () => {
    const { onPress } = renderPreview();

    fireEvent.press(screen.getByLabelText('Paket içeriği, 2 ürün'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('stays readable in the dark theme', () => {
    renderPreview({ selectedCount: 2 }, 'dark');

    expect(screen.getByText('Bu paket 2 üründen oluşuyor')).toBeTruthy();
    expect(screen.getByText('Bedenler seçildi — sepete ekleyebilirsiniz')).toBeTruthy();
  });
});
