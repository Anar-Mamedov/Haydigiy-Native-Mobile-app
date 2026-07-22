import { Text, View } from 'react-native';
import { screen } from '@testing-library/react-native';
import { AppAlertDialog } from './app-alert-dialog';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const ReactNative = jest.requireActual('react-native');

  const AlertDialog: any = function MockAlertDialog({ children }: { children: unknown }) {
    return React.createElement(React.Fragment, null, children);
  };
  AlertDialog.Portal = function MockAlertDialogPortal({ children }: { children: unknown }) {
    return React.createElement(React.Fragment, null, children);
  };
  AlertDialog.Overlay = function MockAlertDialogOverlay(props: object) {
    return React.createElement(ReactNative.View, {
      testID: 'app-alert-dialog-overlay',
      ...props,
    });
  };
  AlertDialog.Content = function MockAlertDialogContent({
    children,
    ...props
  }: {
    children: unknown;
  }) {
    return React.createElement(ReactNative.View, props, children);
  };

  return { ...jest.requireActual('tamagui'), AlertDialog };
});

describe('AppAlertDialog', () => {
  it('uses the shared backdrop opacity by default', () => {
    renderWithTamagui(
      <AppAlertDialog onOpenChange={jest.fn()} open>
        <View>
          <Text>İçerik</Text>
        </View>
      </AppAlertDialog>,
    );

    const overlay = screen.getByTestId('app-alert-dialog-overlay');
    expect(overlay.props.backgroundColor).toBe('$shadowColor');
    expect(overlay.props.opacity).toBe(0.5);
  });

  it('allows a dialog to request a darker backdrop', () => {
    renderWithTamagui(
      <AppAlertDialog
        onOpenChange={jest.fn()}
        open
        overlayBackgroundColor="$black"
        overlayOpacity={0.5}
      >
        <View>
          <Text>İçerik</Text>
        </View>
      </AppAlertDialog>,
    );

    const overlay = screen.getByTestId('app-alert-dialog-overlay');
    expect(overlay.props.backgroundColor).toBe('$black');
    expect(overlay.props.opacity).toBe(0.5);
  });
});
