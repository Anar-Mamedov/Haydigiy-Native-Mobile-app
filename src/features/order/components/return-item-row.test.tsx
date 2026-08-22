import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ReturnItemRow } from './return-item-row';
import { ExpandedReturnItem } from '../hooks/use-return-create-controller';
import { BundleComponent } from '@/types/bundle.types';
import { OrderDetailItem } from '@/types/order.types';

// `@/components/ui` barrel'ı expo-router'a bağlı bileşenleri de çekiyor; bu test
// yalnızca iade satırını doğruluyor, yönlendirme mock'lanır.
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  usePathname: () => '/return-create',
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: false })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
}));

const BASE_ITEM: OrderDetailItem = {
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
    imageUrl: '',
    variantName: 'L',
    quantity: 1,
    price: 1250,
  },
  {
    key: 'c2',
    orderItemId: 8802,
    title: 'Kruvaze Ceket',
    slug: 'kruvaze-ceket',
    imageUrl: '',
    variantName: 'M',
    quantity: 1,
    price: 1250,
  },
];

const BUNDLE_ENTRY: ExpandedReturnItem = {
  expandedId: 'bundle:101703d9',
  item: BASE_ITEM,
  isBundle: true,
  quantity: 1,
  members: [
    { orderItemId: 8801, quantity: 1 },
    { orderItemId: 8802, quantity: 1 },
  ],
  components: COMPONENTS,
  isNonReturnable: false,
};

const PRODUCT_ENTRY: ExpandedReturnItem = {
  expandedId: '9001-0',
  item: { ...BASE_ITEM, id: 9001, name: 'Uzun Kollu Gömlek', variantName: 'M' },
  isBundle: false,
  quantity: 1,
  members: [{ orderItemId: 9001, quantity: 1 }],
  components: [],
  isNonReturnable: false,
};

function renderRow(
  overrides: Partial<React.ComponentProps<typeof ReturnItemRow>> = {},
  theme?: 'light' | 'dark',
) {
  const onToggle = overrides.onToggle ?? jest.fn();
  const onReasonChange = overrides.onReasonChange ?? jest.fn();
  const onPhotoChange = overrides.onPhotoChange ?? jest.fn();

  const utils = renderWithTamagui(
    <ReturnItemRow
      entry={BUNDLE_ENTRY}
      reasons={[{ id: 1, name: 'Beden uymadı' }]}
      reasonsError={null}
      reasonsLoading={false}
      selected={false}
      {...overrides}
      onPhotoChange={onPhotoChange}
      onReasonChange={onReasonChange}
      onToggle={onToggle}
    />,
    theme,
  );

  return { ...utils, onToggle, onReasonChange, onPhotoChange };
}

describe('ReturnItemRow — paket satırı', () => {
  it('marks the row as a package', () => {
    renderRow();

    expect(screen.getByText('PAKET')).toBeTruthy();
  });

  it('states that the package is returned as a whole', () => {
    renderRow();

    expect(screen.getByText('Paket içeriği (2 ürün) — paket bütün olarak iade edilir')).toBeTruthy();
  });

  it('offers a single checkbox for the package, not one per product', () => {
    renderRow();

    expect(screen.getByLabelText('Deneme bundle ürününü iade için seç')).toBeTruthy();
    expect(screen.queryByLabelText('Kemer Detaylı Elbise ürününü iade için seç')).toBeNull();
    expect(screen.queryByLabelText('Kruvaze Ceket ürününü iade için seç')).toBeNull();
  });

  it('lists the package contents so the shopper sees what is being returned', () => {
    renderRow();

    expect(screen.getByText('Kemer Detaylı Elbise')).toBeTruthy();
    expect(screen.getByText('Kruvaze Ceket')).toBeTruthy();
  });

  it('selects the whole package with one tap', () => {
    const { onToggle } = renderRow();

    fireEvent.press(screen.getByLabelText('Deneme bundle ürününü iade için seç'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows the package quantity when more than one was ordered', () => {
    renderRow({ entry: { ...BUNDLE_ENTRY, quantity: 2 } });

    expect(screen.getByText('2 ürün · 2 adet')).toBeTruthy();
  });

  it('asks for a return reason once the package is selected', () => {
    renderRow({ selected: true });

    // Başlık ve seçim kutusunun etiketi aynı metni taşıyor.
    expect(screen.getAllByText('İade Nedeni').length).toBeGreaterThan(0);
    expect(screen.getByText('Seçiniz')).toBeTruthy();
  });

  it('keeps the package labels readable in the dark theme', () => {
    renderRow({}, 'dark');

    expect(screen.getByText('PAKET')).toBeTruthy();
    expect(screen.getByText('Deneme bundle')).toBeTruthy();
    expect(screen.getByText('Kruvaze Ceket')).toBeTruthy();
  });
});

describe('ReturnItemRow — normal ürün', () => {
  it('shows the size and no package copy', () => {
    renderRow({ entry: PRODUCT_ENTRY });

    expect(screen.getByText('M')).toBeTruthy();
    expect(screen.queryByText('PAKET')).toBeNull();
    expect(screen.queryByText(/Paket içeriği/)).toBeNull();
  });
});
