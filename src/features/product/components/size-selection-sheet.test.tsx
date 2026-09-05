import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { FeatureIcon } from '@/types/product.types';
import { SizeSelectionSheet } from './size-selection-sheet';
import { Theme } from 'tamagui';

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

describe('SizeSelectionSheet — price', () => {
  it('keeps the plain price label when the product has no discount', () => {
    renderWithTamagui(
      <SizeSelectionSheet {...sheetBaseProps} selectedVariant={null} variants={[inStockVariant]} />,
    );

    expect(screen.getByText('349,99 TL')).toBeTruthy();
    expect(screen.queryByTestId('size-selection-sheet-discount-price')).toBeNull();
  });

  it('shows the discount box instead of the plain label when the product is discounted', () => {
    renderWithTamagui(
      <SizeSelectionSheet
        {...sheetBaseProps}
        discountRate={30}
        firstPrice={499.99}
        hasDiscount
        price={349.99}
        selectedVariant={null}
        variants={[inStockVariant]}
      />,
    );

    expect(screen.getByTestId('size-selection-sheet-discount-price')).toBeTruthy();
    expect(screen.getByText('%30')).toBeTruthy();
    expect(screen.getByText('499,99 TL')).toBeTruthy();
  });
});

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
        onNotifyMe={onNotifyMe}
        selectedVariant={soldOutVariant}
        variants={[inStockVariant, soldOutVariant]}
      />,
    );

    fireEvent.press(screen.getByTestId('sheet-notify-me'));

    expect(onNotifyMe).toHaveBeenCalledTimes(1);
  });

  // Misafire özel devre dışı "Tükendi" dalı kaldırıldı; bildirim herkese açık.
  it('no longer hides the notification behind a disabled sold-out button', () => {
    renderWithTamagui(
      <SizeSelectionSheet
        {...sheetBaseProps}
        selectedVariant={soldOutVariant}
        variants={[soldOutVariant]}
      />,
    );

    expect(screen.queryByTestId('sheet-out-of-stock')).toBeNull();
    expect(screen.getByTestId('sheet-notify-me')).toBeTruthy();
  });

  it('confirms a request that was already sent for that size', () => {
    renderWithTamagui(
      <SizeSelectionSheet
        {...sheetBaseProps}
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
        selectedVariant={inStockVariant}
        variants={[inStockVariant]}
      />,
    );

    expect(screen.getByText('Sepete Ekle')).toBeTruthy();
    expect(screen.queryByTestId('sheet-notify-me')).toBeNull();
  });
});

describe('SizeSelectionSheet', () => {
  it('disables sizes and purchase after sale approval is withdrawn, including across theme changes', () => {
    const onConfirm = jest.fn();
    const onSelectVariant = jest.fn();
    const sheet = (theme: 'light' | 'dark', isApprovedForSale: boolean) => (
      <Theme name={theme}>
        <SizeSelectionSheet
          {...sheetBaseProps}
          isApprovedForSale={isApprovedForSale}
          onConfirm={onConfirm}
          onSelectVariant={onSelectVariant}
          selectedVariant={inStockVariant}
          variants={[inStockVariant, soldOutVariant]}
        />
      </Theme>
    );
    const { rerender } = renderWithTamagui(sheet('light', true));

    expect(screen.getByText('Sepete Ekle')).toBeEnabled();

    for (const theme of ['light', 'dark', 'light'] as const) {
      rerender(sheet(theme, false));

      for (const variant of [inStockVariant, soldOutVariant]) {
        const button = screen.getByLabelText(`Beden ${variant.name} satışa kapalı`);
        expect(button).toBeDisabled();
        expect(button).not.toBeSelected();
        expect(screen.getByText(variant.name)).toHaveStyle({ textDecorationLine: 'line-through' });
        fireEvent.press(button);
      }
      expect(screen.getByText('Ürün şu an satışa kapalıdır, daha sonra tekrar deneyiniz.')).toBeTruthy();
      expect(screen.queryByText('Sepete eklemek için bir beden seçin')).toBeNull();
      expect(screen.queryByTestId('sheet-notify-me')).toBeNull();
      expect(screen.getByText('Sepete Ekle')).toBeDisabled();
      fireEvent.press(screen.getByText('Sepete Ekle'));
    }

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onSelectVariant).not.toHaveBeenCalled();

    rerender(sheet('dark', true));
    fireEvent.press(screen.getByText('Sepete Ekle'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

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

  // AGENTS.md: tema duyarlı paylaşılan bileşenler dark modda da doğrulanmalı.
  it('keeps the sold-out actions readable in dark theme', () => {
    renderWithTamagui(
      <SizeSelectionSheet
        {...sheetBaseProps}
        selectedVariant={soldOutVariant}
        variants={[soldOutVariant]}
      />,
      'dark',
    );

    expect(screen.getByTestId('sheet-notify-me')).toBeTruthy();
    expect(screen.getByText('Gelince Haber Ver')).toBeTruthy();
  });
});
