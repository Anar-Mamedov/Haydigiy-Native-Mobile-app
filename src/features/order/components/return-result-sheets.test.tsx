import { StyleSheet } from 'react-native';
import { screen } from '@testing-library/react-native';
import { ReturnResultSheets } from './return-result-sheets';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, props, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, props);
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

describe('ReturnResultSheets', () => {
  it('expands the success sheet to the available screen height and keeps its action above the safe area', () => {
    renderWithTamagui(
      <ReturnResultSheets
        errorMessage={null}
        isRecreating={false}
        isStorePickup={false}
        onCloseError={jest.fn()}
        onCloseSuccess={jest.fn()}
        onRecreatePtt={jest.fn()}
        returnMethod="hepsijet"
        successMessage="Randevunuz oluşturuldu!"
      />,
    );

    const scroll = screen.getByTestId('return-success-sheet-scroll');

    // Mocked safe-area frame 812 - top inset 40 - 24 pt top clearance.
    expect(StyleSheet.flatten(scroll.props.style)?.maxHeight).toBe(748);
    // Mocked bottom inset 20 keeps the action clear of the system navigation area.
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle)?.paddingBottom).toBe(20);
    expect(screen.getByLabelText('Siparişlerime dön')).toBeTruthy();
  });
});
