import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ReturnItemRow } from './return-item-row';
import { ExpandedReturnItem } from '../hooks/use-return-create-controller';
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
  name: 'Kemer Detaylı Elbise',
  variantName: 'L',
  slug: 'kemer-detayli-elbise',
  image: 'https://cdn/elbise.webp',
  quantity: 1,
  price: 1250,
  kind: 'normal',
};

/** Paket bileşeni de normal ürün gibi tek başına seçilebilen bir satırdır. */
const BUNDLE_COMPONENT_ROW: ExpandedReturnItem = {
  expandedId: '8801-0',
  item: BASE_ITEM,
  orderItemId: 8801,
  quantity: 1,
  isNonReturnable: false,
  isBundleComponent: true,
};

const PRODUCT_ROW: ExpandedReturnItem = {
  expandedId: '9001-0',
  item: { ...BASE_ITEM, id: 9001, name: 'Uzun Kollu Gömlek', variantName: 'M' },
  orderItemId: 9001,
  quantity: 1,
  isNonReturnable: false,
  isBundleComponent: false,
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
      reasons={[{ id: 1, name: 'Beden uymadı' }]}
      reasonsError={null}
      reasonsLoading={false}
      row={BUNDLE_COMPONENT_ROW}
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

describe('ReturnItemRow — paket bileşeni', () => {
  it('shows the component with its own name and size', () => {
    renderRow();

    expect(screen.getByText('Kemer Detaylı Elbise')).toBeTruthy();
    expect(screen.getByText('L')).toBeTruthy();
  });

  it('offers its own checkbox so a single package product can be returned', () => {
    const { onToggle } = renderRow();

    fireEvent.press(screen.getByLabelText('Kemer Detaylı Elbise ürününü iade için seç'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('asks for a return reason once the row is selected', () => {
    renderRow({ selected: true });

    // Başlık ve seçim kutusunun etiketi aynı metni taşıyor.
    expect(screen.getAllByText('İade Nedeni').length).toBeGreaterThan(0);
    expect(screen.getByText('Seçiniz')).toBeTruthy();
  });

  it('keeps the labels readable in the dark theme', () => {
    renderRow({}, 'dark');

    expect(screen.getByText('Kemer Detaylı Elbise')).toBeTruthy();
  });
});

describe('ReturnItemRow — normal ürün', () => {
  it('renders exactly like a package component', () => {
    renderRow({ row: PRODUCT_ROW });

    expect(screen.getByText('Uzun Kollu Gömlek')).toBeTruthy();
    expect(screen.getByText('M')).toBeTruthy();
    expect(screen.queryByText('PAKET')).toBeNull();
  });
});
