import { screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
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
});
