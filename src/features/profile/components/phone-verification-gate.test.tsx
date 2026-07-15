import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { PhoneVerificationGate } from './phone-verification-gate';

const mockSendCode = jest.fn();
const mockRefetch = jest.fn();
const mockReplace = jest.fn();
let mockProfileResult: Record<string, unknown>;
let mockOtpProps: Record<string, any> | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/features/auth/api/auth.mutations', () => ({
  useSendCodeMutation: () => ({ mutateAsync: mockSendCode }),
}));

jest.mock('../api/profile.queries', () => ({
  useUserProfileQuery: () => mockProfileResult,
}));

jest.mock('./phone-verification-sheet', () => ({
  PhoneVerificationSheet: ({ children, open }: any) => {
    const React = jest.requireActual('react');
    const { View } = jest.requireActual('react-native');
    return open
      ? React.createElement(View, { testID: 'mock-phone-verification-sheet' }, children)
      : null;
  },
}));

jest.mock('@/features/auth/components/otp-verification', () => ({
  OtpVerification: (props: Record<string, any>) => {
    const React = jest.requireActual('react');
    const { Pressable, Text, View } = jest.requireActual('react-native');
    mockOtpProps = props;
    return React.createElement(
      View,
      { testID: 'mock-otp-verification' },
      React.createElement(Text, null, props.identifier),
      React.createElement(Text, null, props.cancelLabel),
      React.createElement(Pressable, {
        onPress: () => void props.onSuccess(),
        testID: 'complete-phone-verification',
      }),
      React.createElement(Pressable, {
        onPress: () => void props.onCancel(),
        testID: 'exit-phone-verification',
      }),
    );
  },
}));

const pendingProfile = {
  birthDate: null,
  email: 'anar@example.com',
  emailVerified: false,
  gender: 'male',
  name: 'Anar',
  needsPhoneVerification: true,
  phone: '5076534634',
  phoneVerificationStatus: 'pending',
  phoneVerified: false,
  surname: 'Mamedov',
};

describe('PhoneVerificationGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOtpProps = null;
    mockSendCode.mockResolvedValue({ message: 'Doğrulama kodu gönderildi.', remaining_seconds: 60 });
    mockRefetch.mockResolvedValue({ data: { ...pendingProfile, phoneVerified: true } });
    mockProfileResult = { data: pendingProfile, refetch: mockRefetch };
    useAuthStore.setState({
      isLoading: false,
      user: { id: '8', email: 'anar@example.com', name: 'Anar' },
    });
  });

  afterEach(async () => {
    await act(async () => {
      useAuthStore.setState({ isLoading: false, user: null });
    });
  });

  it('automatically sends one code and blocks the session with the profile OTP flow', async () => {
    const view = renderWithTamagui(<PhoneVerificationGate />);

    await waitFor(() =>
      expect(mockSendCode).toHaveBeenCalledWith({ type: 'phone', value: '5076534634' }),
    );
    await waitFor(() => expect(mockOtpProps?.initialCooldown).toBe(60));
    expect(mockSendCode).toHaveBeenCalledTimes(1);
    expect(mockOtpProps).toMatchObject({
      cancelLabel: 'Çıkış Yap',
      flowType: 'profile',
      identifier: '5076534634',
    });
    expect(screen.getByTestId('mock-phone-verification-sheet')).toBeTruthy();

    view.rerender(<PhoneVerificationGate />);
    expect(mockSendCode).toHaveBeenCalledTimes(1);
  });

  it('refreshes the profile after successful OTP verification', async () => {
    renderWithTamagui(<PhoneVerificationGate />);
    await waitFor(() => expect(mockSendCode).toHaveBeenCalledTimes(1));

    fireEvent.press(screen.getByTestId('complete-phone-verification'));
    await waitFor(() => expect(mockRefetch).toHaveBeenCalledTimes(1));
  });

  it('signs out and returns home when the user chooses not to verify', async () => {
    renderWithTamagui(<PhoneVerificationGate />);
    await waitFor(() => expect(mockSendCode).toHaveBeenCalledTimes(1));

    await act(async () => {
      fireEvent.press(screen.getByTestId('exit-phone-verification'));
    });

    await waitFor(() => expect(useAuthStore.getState().user).toBeNull());
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('does not open or send a code when the phone is already verified', () => {
    mockProfileResult = {
      data: {
        ...pendingProfile,
        needsPhoneVerification: false,
        phoneVerificationStatus: null,
        phoneVerified: true,
      },
      refetch: mockRefetch,
    };

    renderWithTamagui(<PhoneVerificationGate />);

    expect(screen.queryByTestId('mock-phone-verification-sheet')).toBeNull();
    expect(mockSendCode).not.toHaveBeenCalled();
  });
});
