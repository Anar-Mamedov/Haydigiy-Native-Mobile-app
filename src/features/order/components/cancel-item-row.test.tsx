import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CancelItemRow } from './cancel-item-row';
import { BundleComponent } from '@/types/bundle.types';
import { OrderDetailItem } from '@/types/order.types';

const ITEM: OrderDetailItem = {
  id: 8801,
  name: 'Deneme bundle',
  variantName: '',
  slug: 'deneme-bundle',
  image: 'https://cdn/bundle.webp',
  quantity: 1,
  price: 2000,
  kind: 'normal',
};

const COMPONENTS: BundleComponent[] = [
  {
    key: 'c1',
    orderItemId: 8801,
    title: 'Kemer Detaylı Elbise',
    slug: 'kemer-detayli-elbise',
    imageUrl: 'https://cdn/elbise.webp',
    variantName: 'L',
    quantity: 1,
    price: 1250,
  },
  {
    key: 'c2',
    orderItemId: 8802,
    title: 'Kruvaze Ceket',
    slug: 'kruvaze-ceket',
    imageUrl: 'https://cdn/ceket.webp',
    variantName: 'M',
    quantity: 1,
    price: 1250,
  },
];

function renderRow(
  overrides: Partial<React.ComponentProps<typeof CancelItemRow>> = {},
  theme?: 'light' | 'dark',
) {
  const onToggle = overrides.onToggle ?? jest.fn();
  const onPressReason = overrides.onPressReason ?? jest.fn();

  const utils = renderWithTamagui(
    <CancelItemRow
      disabled={false}
      item={ITEM}
      selected={false}
      {...overrides}
      onPressReason={onPressReason}
      onToggle={onToggle}
    />,
    theme,
  );

  return { ...utils, onToggle, onPressReason };
}

describe('CancelItemRow — paket satırı', () => {
  const bundleProps = { isBundle: true, bundleComponents: COMPONENTS };

  it('marks the row as a package', () => {
    renderRow(bundleProps);

    expect(screen.getByText('PAKET')).toBeTruthy();
  });

  it('states that the package can only be cancelled as a whole', () => {
    renderRow(bundleProps);

    expect(
      screen.getByText('Paket içeriği (2 ürün) — paket bütün olarak iptal edilir'),
    ).toBeTruthy();
  });

  it('always shows the package contents expanded, never as separate choices', () => {
    renderRow(bundleProps);

    expect(screen.getByText('Kemer Detaylı Elbise')).toBeTruthy();
    expect(screen.getByText('Kruvaze Ceket')).toBeTruthy();
    // İçindeki ürünlerin kendi seçim kutusu YOKTUR; tek seçim paketin kendisidir.
    expect(screen.queryByLabelText('Kemer Detaylı Elbise seç')).toBeNull();
    expect(screen.queryByLabelText('Kruvaze Ceket seç')).toBeNull();
  });

  it('selects the whole package with one tap', () => {
    const { onToggle } = renderRow(bundleProps);

    fireEvent.press(screen.getByLabelText('Deneme bundle seç'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('falls back to the item count when the package has no size label', () => {
    renderRow(bundleProps);

    // Aynı metin paket içeriği başlığında da geçtiği için tümü aranır.
    expect(screen.getAllByText('2 ürün').length).toBeGreaterThan(0);
  });

  it('prefers the label the backend sends for the package', () => {
    renderRow({ ...bundleProps, item: { ...ITEM, variantName: '2 parça takım' } });

    expect(screen.getByText('2 parça takım')).toBeTruthy();
  });

  it('does not toggle while the row is disabled', () => {
    const { onToggle } = renderRow({ ...bundleProps, disabled: true });

    fireEvent.press(screen.getByLabelText('Deneme bundle seç'));

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('asks for a cancellation reason once the package is selected', () => {
    const { onPressReason } = renderRow({ ...bundleProps, selected: true });

    expect(screen.getByText('İptal Nedeni')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('İptal nedeni seç'));

    expect(onPressReason).toHaveBeenCalledTimes(1);
  });

  it('keeps the package labels readable in the dark theme', () => {
    renderRow(bundleProps, 'dark');

    expect(screen.getByText('PAKET')).toBeTruthy();
    expect(screen.getByText('Deneme bundle')).toBeTruthy();
    expect(screen.getByText('Kemer Detaylı Elbise')).toBeTruthy();
  });
});

describe('CancelItemRow — normal ürün', () => {
  it('shows the size instead of package copy', () => {
    renderRow({ item: { ...ITEM, name: 'Uzun Kollu Gömlek', variantName: 'M' } });

    expect(screen.getByText('Beden: M')).toBeTruthy();
    expect(screen.queryByText('PAKET')).toBeNull();
    expect(screen.queryByText(/Paket içeriği/)).toBeNull();
  });
});
