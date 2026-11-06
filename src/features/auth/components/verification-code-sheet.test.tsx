import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { VerificationCodeSheet, type VerificationCodeSheetProps } from './verification-code-sheet';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'verification-code-sheet', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, props);
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

const COPY = {
  title: 'E-posta Doğrulama',
  description: 'anar@example.com adresine 6 haneli bir doğrulama kodu gönderdik.',
  codeLabel: '6 haneli e-posta doğrulama kodu',
  codeFocusLabel: 'E-posta doğrulama kodunu gir',
  submitLabel: 'Doğrula',
  submitAccessibilityLabel: 'E-postayı doğrula',
};

function renderSheet(overrides: Partial<VerificationCodeSheetProps> = {}, theme?: 'dark') {
  const props: VerificationCodeSheetProps = {
    code: '',
    codeLength: 6,
    cooldownSeconds: 0,
    copy: COPY,
    isResending: false,
    isVerifying: false,
    onCancel: jest.fn(),
    onChangeCode: jest.fn(),
    onResend: jest.fn(),
    onSubmit: jest.fn(),
    open: true,
    testIDPrefix: 'email-verification',
    ...overrides,
  };

  return { ...renderWithTamagui(<VerificationCodeSheet {...props} />, theme), props };
}

describe('VerificationCodeSheet', () => {
  it('follows the keyboard-aware form sheet contract', () => {
    renderSheet();

    const sheet = screen.getByTestId('verification-code-sheet');
    expect(sheet.props.moveOnKeyboardChange).toBe(true);
    expect(sheet.props.snapPointsMode).toBe('fit');
    expect(sheet.props.snapPoints).toBeUndefined();
    expect(sheet.props.dismissOnSnapToBottom).toBeUndefined();
    expect(sheet.props.dismissOnOverlayPress).toBe(true);

    const frame = screen.getByTestId('email-verification-sheet-frame');
    expect(frame.props.adjustPaddingForOffscreenContent).toBe(true);
    expect(frame.props.overflow).toBe('visible');
    expect(frame.props.maxHeight).toBe('92%');
    expect(screen.getByTestId('email-verification-sheet-bottom-cover')).toBeTruthy();

    const scroller = screen.getByTestId('email-verification-keyboard-aware-scroll');
    expect(scroller.props.bounces).toBe(false);
    expect(scroller.props.alwaysBounceVertical).toBe(false);
    expect(scroller.props.overScrollMode).toBe('never');
    expect(scroller.props.keyboardShouldPersistTaps).toBe('handled');

    // Every input carries an accessible label.
    expect(screen.getByLabelText('6 haneli e-posta doğrulama kodu')).toBeTruthy();
  });

  it('shows the flow-specific title and description', () => {
    renderSheet();

    expect(screen.getByText('E-posta Doğrulama')).toBeTruthy();
    expect(screen.getByText(/anar@example.com adresine 6 haneli/)).toBeTruthy();
  });

  it('keeps submit disabled until the code is complete', () => {
    const { props } = renderSheet({ code: '123' });

    fireEvent.press(screen.getByLabelText('E-postayı doğrula'));
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('submits a complete code', () => {
    const { props } = renderSheet({ code: '123456' });

    fireEvent.press(screen.getByLabelText('E-postayı doğrula'));
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit twice while the code is being checked', () => {
    const { props } = renderSheet({ code: '123456', isVerifying: true });

    fireEvent.press(screen.getByLabelText('E-postayı doğrula'));
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('shows the countdown instead of the resend control while cooling down', () => {
    renderSheet({ cooldownSeconds: 59 });

    expect(screen.getByText('00:59')).toBeTruthy();
    expect(screen.queryByLabelText('Doğrulama kodunu tekrar gönder')).toBeNull();
  });

  it('allows a resend once the cooldown expires', () => {
    const { props } = renderSheet();

    fireEvent.press(screen.getByLabelText('Doğrulama kodunu tekrar gönder'));
    expect(props.onResend).toHaveBeenCalledTimes(1);
  });

  it('does not resend while a resend is in flight', () => {
    const { props } = renderSheet({ isResending: true });

    expect(screen.getByText('Gönderiliyor...')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Doğrulama kodunu tekrar gönder'));
    expect(props.onResend).not.toHaveBeenCalled();
  });

  it('prefers the error over the info message', () => {
    renderSheet({ errorMessage: 'Kod geçersiz veya süresi dolmuş.', infoMessage: 'Kod gönderildi.' });

    expect(screen.getByText('Kod geçersiz veya süresi dolmuş.')).toBeTruthy();
    expect(screen.queryByText('Kod gönderildi.')).toBeNull();
  });

  it('cancels from the close control and from "Vazgeç"', () => {
    const { props } = renderSheet();

    fireEvent.press(screen.getByLabelText('Doğrulamayı kapat'));
    fireEvent.press(screen.getByLabelText('Vazgeç'));
    expect(props.onCancel).toHaveBeenCalledTimes(2);
  });

  it('paints the submit button differently for a destructive flow', () => {
    const submitBackground = () =>
      StyleSheet.flatten(screen.getByTestId('email-verification-submit').props.style)?.backgroundColor;

    const brandRender = renderSheet({ code: '123456' });
    const brandColor = submitBackground();
    brandRender.unmount();

    renderSheet({ code: '123456', submitTone: 'danger' });
    const dangerColor = submitBackground();

    expect(brandColor).toBeTruthy();
    expect(dangerColor).toBeTruthy();
    expect(dangerColor).not.toBe(brandColor);
  });

  it('stays readable in dark mode', () => {
    renderSheet({}, 'dark');

    expect(screen.getByText('E-posta Doğrulama')).toBeTruthy();
    expect(screen.getByLabelText('Doğrulamayı kapat')).toBeTruthy();
    expect(screen.getByLabelText('E-postayı doğrula')).toBeTruthy();
    expect(screen.getByText('Kodu Tekrar Gönder')).toBeTruthy();
  });
});
