import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { FeatureIcon } from '@/types/product.types';
import { SizeSelectionSheet } from './size-selection-sheet';

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

  return {
    ...actual,
    Sheet: SheetRoot,
  };
});

const featureIcons: FeatureIcon[] = [
  {
    id: 15,
    name: 'İade Yok',
    slug: 'iade-yok',
    description: 'Bu üründe iade/değişim yoktur.',
    assetUrl: '',
    displayOrder: 1,
  },
  {
    id: 20,
    name: 'Peşin Fiyatına 3 Taksit',
    slug: 'pesin-fiyatina-3-taksit',
    description: 'Peşin Fiyatına 3 Taksit',
    assetUrl: '',
    displayOrder: 2,
  },
];

const soldOutVariant = { hasStock: false, id: '77', name: 'M', price: 100, quantity: 0 };
const inStockVariant = { hasStock: true, id: '78', name: 'S', price: 100, quantity: 3 };

const sheetBaseProps = {
  imageUrl: '',
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  onSelectVariant: jest.fn(),
  open: true as const,
  priceLabel: '349,99 TL',
  productName: 'Test ürün',
};

describe('SizeSelectionSheet — sold-out sizes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lets a sold-out size be selected so a notification can be requested', () => {
    const onSelectVariant = jest.fn();

    renderWithTamagui(
      <SizeSelectionSheet
        {...sheetBaseProps}
        onSelectVariant={onSelectVariant}
        selectedVariant={null}
        variants={[inStockVariant, soldOutVariant]}
      />,
    );

    fireEvent.press(screen.getByLabelText('Beden M stokta yok, gelince haber ver'));

    expect(onSelectVariant).toHaveBeenCalledWith(soldOutVariant);
  });

  it('offers the notification once a sold-out size is selected', () => {
    const onNotifyMe = jest.fn();

    renderWithTamagui(
      <SizeSelectionSheet
        {...sheetBaseProps}
        isAuthenticated
        onNotifyMe={onNotifyMe}
        selectedVariant={soldOutVariant}
        variants={[inStockVariant, soldOutVariant]}
      />,
    );

    fireEvent.press(screen.getByTestId('sheet-notify-me'));

    expect(onNotifyMe).toHaveBeenCalledTimes(1);
  });

  it('reports sold out to a signed-out visitor instead of offering the notification', () => {
    renderWithTamagui(
      <SizeSelectionSheet
        {...sheetBaseProps}
        isAuthenticated={false}
        selectedVariant={soldOutVariant}
        variants={[soldOutVariant]}
      />,
    );

    expect(screen.getByTestId('sheet-out-of-stock')).toBeTruthy();
    expect(screen.queryByTestId('sheet-notify-me')).toBeNull();
  });

  it('confirms a request that was already sent for that size', () => {
    renderWithTamagui(
      <SizeSelectionSheet
        {...sheetBaseProps}
        isAuthenticated
        isNotified
        selectedVariant={soldOutVariant}
        variants={[soldOutVariant]}
      />,
    );

    expect(screen.getByTestId('sheet-notify-requested')).toBeTruthy();
  });

  it('keeps add-to-cart for an in-stock size', () => {
    renderWithTamagui(
      <SizeSelectionSheet
        {...sheetBaseProps}
        isAuthenticated
        selectedVariant={inStockVariant}
        variants={[inStockVariant]}
      />,
    );

    expect(screen.getByText('Sepete Ekle')).toBeTruthy();
    expect(screen.queryByTestId('sheet-notify-me')).toBeNull();
  });
});

describe('SizeSelectionSheet', () => {
  it('shows size skeletons while product variants are loading', () => {
    renderWithTamagui(
      <SizeSelectionSheet
        imageUrl=""
        isLoadingVariants
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        onSelectVariant={jest.fn()}
        open
        priceLabel="349,99 TL"
        productName="Test ürün"
        selectedVariant={null}
        variants={[]}
      />,
    );

    expect(screen.getByText('Bedeninizi seçin')).toBeTruthy();
    expect(screen.getByLabelText('Beden seçenekleri yükleniyor')).toBeTruthy();
  });

  it('keeps every feature description visible at once instead of rotating them', () => {
    jest.useFakeTimers();

    try {
      renderWithTamagui(
        <SizeSelectionSheet
          featureIcons={featureIcons}
          imageUrl=""
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          onSelectVariant={jest.fn()}
          open
          priceLabel="349,99 TL"
          productName="Test ürün"
          selectedVariant={null}
          variants={[]}
        />,
      );

      expect(screen.getByText('Bu üründe iade/değişim yoktur.')).toBeTruthy();
      expect(screen.getByText('Peşin Fiyatına 3 Taksit')).toBeTruthy();

      // A ticker would have swapped the copy by now; the list must not.
      act(() => {
        jest.advanceTimersByTime(9000);
      });

      expect(screen.getByText('Bu üründe iade/değişim yoktur.')).toBeTruthy();
      expect(screen.getByText('Peşin Fiyatına 3 Taksit')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });
});
