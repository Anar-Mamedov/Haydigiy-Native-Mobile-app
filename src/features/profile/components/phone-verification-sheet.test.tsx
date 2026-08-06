import { screen } from '@testing-library/react-native';
import { Paragraph } from '@/components/ui/app-paragraph';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { PhoneVerificationSheet } from './phone-verification-sheet';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'phone-verification-sheet', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, props);
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

describe('PhoneVerificationSheet', () => {
  it('cannot be dismissed and keeps its OTP content keyboard-aware', () => {
    const onExit = jest.fn();
    renderWithTamagui(
      <PhoneVerificationSheet onExit={onExit} open>
        <Paragraph>OTP içeriği</Paragraph>
      </PhoneVerificationSheet>,
    );

    const sheet = screen.getByTestId('phone-verification-sheet');
    expect(sheet.props.disableDrag).toBe(true);
    expect(sheet.props.dismissOnOverlayPress).toBe(false);
    expect(sheet.props.dismissOnSnapToBottom).toBe(false);
    expect(sheet.props.moveOnKeyboardChange).toBe(true);

    const scroller = screen.getByTestId('phone-verification-keyboard-aware-scroll');
    expect(scroller.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroller.props.bounces).toBe(false);
    expect(scroller.props.alwaysBounceVertical).toBe(false);
    expect(scroller.props.overScrollMode).toBe('never');
    expect(screen.getByText('OTP içeriği')).toBeTruthy();

    sheet.props.onOpenChange(false);
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
