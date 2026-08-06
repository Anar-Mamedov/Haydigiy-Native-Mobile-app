import { act, screen } from '@testing-library/react-native';
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
