import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { DeleteAccountVerificationSheet } from './delete-account-verification-sheet';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(
      View,
      { testID: 'delete-account-verification-sheet', ...props },
      children,
    );
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, props);
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

function renderSheet(overrides: Partial<React.ComponentProps<typeof DeleteAccountVerificationSheet>> = {}) {
  const props = {
    code: '',
    cooldownSeconds: 0,
    isResending: false,
    isVerifying: false,
    onCancel: jest.fn(),
    onChangeCode: jest.fn(),
    onResend: jest.fn(),
    onSubmit: jest.fn(),
    open: true,
    ...overrides,
  };

  return { ...renderWithTamagui(<DeleteAccountVerificationSheet {...props} />), props };
}

describe('DeleteAccountVerificationSheet', () => {
  it('follows the keyboard-aware form sheet contract', () => {
    renderSheet();

    const sheet = screen.getByTestId('delete-account-verification-sheet');
    expect(sheet.props.moveOnKeyboardChange).toBe(true);
    expect(sheet.props.snapPointsMode).toBe('fit');
    expect(sheet.props.snapPoints).toBeUndefined();
    expect(sheet.props.dismissOnSnapToBottom).toBeUndefined();
    expect(sheet.props.dismissOnOverlayPress).toBe(true);

    const frame = screen.getByTestId('delete-account-verification-sheet-frame');
    expect(frame.props.adjustPaddingForOffscreenContent).toBe(true);
    expect(frame.props.overflow).toBe('visible');
    expect(frame.props.maxHeight).toBe('92%');
    expect(screen.getByTestId('delete-account-verification-sheet-bottom-cover')).toBeTruthy();

    const scroller = screen.getByTestId('delete-account-verification-keyboard-aware-scroll');
    expect(scroller.props.bounces).toBe(false);
    expect(scroller.props.alwaysBounceVertical).toBe(false);
    expect(scroller.props.overScrollMode).toBe('never');
    expect(scroller.props.keyboardShouldPersistTaps).toBe('handled');

    // Every input carries an accessible label.
    expect(screen.getByLabelText('6 haneli hesap silme doğrulama kodu')).toBeTruthy();
  });

  it('keeps the destructive action disabled until the code is complete', () => {
    const { props } = renderSheet({ code: '123' });

    fireEvent.press(screen.getByLabelText('Hesabımı sil'));
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('submits a complete code', () => {
    const { props } = renderSheet({ code: '123456' });

    fireEvent.press(screen.getByLabelText('Hesabımı sil'));
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows the countdown instead of the resend control while cooling down', () => {
    renderSheet({ cooldownSeconds: 59 });

    expect(screen.getByText('00:59')).toBeTruthy();
    expect(screen.queryByLabelText('Doğrulama kodunu tekrar gönder')).toBeNull();
  });

  it('allows a resend once the cooldown expires', () => {
    const { props } = renderSheet({ cooldownSeconds: 0 });

    fireEvent.press(screen.getByLabelText('Doğrulama kodunu tekrar gönder'));
    expect(props.onResend).toHaveBeenCalledTimes(1);
  });

  it('surfaces the backend message for a rejected code', () => {
    renderSheet({ errorMessage: 'Doğrulama kodu hatalı. 3 hakkınız kaldı.' });

    expect(screen.getByText('Doğrulama kodu hatalı. 3 hakkınız kaldı.')).toBeTruthy();
  });

  it('stays readable in dark mode', () => {
    renderWithTamagui(
      <DeleteAccountVerificationSheet
        code=""
        cooldownSeconds={0}
        isResending={false}
        isVerifying={false}
        onCancel={jest.fn()}
        onChangeCode={jest.fn()}
        onResend={jest.fn()}
        onSubmit={jest.fn()}
        open
      />,
      'dark',
    );

    expect(screen.getByText('Hesap Silme Doğrulaması')).toBeTruthy();
    expect(screen.getByLabelText('Doğrulamayı kapat')).toBeTruthy();
    expect(screen.getByLabelText('Hesabımı sil')).toBeTruthy();
  });
});
