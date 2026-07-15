import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OtpVerification } from './otp-verification';

const mockVerifyCode = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, push: jest.fn(), replace: jest.fn() }),
}));

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

jest.mock('../api/auth.mutations', () => ({
  useFastLoginInitMutation: () => ({ mutateAsync: jest.fn() }),
  useFastLoginVerifyMutation: () => ({ mutateAsync: jest.fn() }),
  useSendCodeMutation: () => ({ mutateAsync: jest.fn() }),
  useVerifyCodeMutation: () => ({ mutateAsync: mockVerifyCode }),
}));

describe('OtpVerification profile flow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('accepts a successful verification response without requiring a new login token', async () => {
    const onSuccess = jest.fn().mockResolvedValue(undefined);
    mockVerifyCode.mockResolvedValue({ message: 'Telefon doğrulandı.' });
    const view = renderWithTamagui(
      <OtpVerification
        flowType="profile"
        identifier="5076534634"
        initialCooldown={0}
        onCancel={jest.fn()}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.changeText(view.UNSAFE_getByType(TextInput), '123456');
    fireEvent.press(screen.getByText('Doğrula ve Devam Et'));

    await waitFor(() =>
      expect(mockVerifyCode).toHaveBeenCalledWith({
        code: '123456',
        type: 'phone',
        value: '5076534634',
      }),
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
