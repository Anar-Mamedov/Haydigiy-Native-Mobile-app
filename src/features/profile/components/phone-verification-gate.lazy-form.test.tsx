import { act, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useAuthStore } from '@/features/auth/store/use-auth-store';

/**
 * Kapı kök layout'ta her açılışta mount ediliyor. OTP formu (zod şemaları dahil)
 * yalnızca kapı açılınca yüklenmeli; aksi halde her açılışta ilk kareden önce çalışır.
 * Modül kaydı test dosyası başına taze olduğu için bu kontrol ayrı dosyada duruyor.
 */
const mockOtpModuleLoaded = jest.fn();
let mockProfileResult: Record<string, unknown>;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@/features/auth/api/auth.mutations', () => ({
  // Gönderim bu testin konusu değil; bekleyen söz test bittikten sonra durum güncellemez.
  useSendCodeMutation: () => ({ mutateAsync: () => new Promise(() => {}) }),
}));

jest.mock('../api/profile.queries', () => ({
  useUserProfileQuery: () => mockProfileResult,
}));

jest.mock('./phone-verification-sheet', () => ({
  PhoneVerificationSheet: ({ children, open }: any) => {
    const React = jest.requireActual('react');
    const { View } = jest.requireActual('react-native');
    return open ? React.createElement(View, null, children) : null;
  },
}));

jest.mock('@/features/auth/components/otp-verification', () => {
  mockOtpModuleLoaded();
  return {
    OtpVerification: () => {
      const React = jest.requireActual('react');
      const { View } = jest.requireActual('react-native');
      return React.createElement(View, { testID: 'mock-otp-verification' });
    },
  };
});

const profile = {
  needsPhoneVerification: false,
  phone: '5076534634',
  phoneVerified: true,
};

describe('PhoneVerificationGate form loading', () => {
  beforeEach(() => {
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

  it('loads the OTP form module only once the gate opens', async () => {
    // Kapı modülü test içinde yüklenir: form doğrudan içe aktarılırsa bu satırda yüklenir.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PhoneVerificationGate } = require('./phone-verification-gate') as typeof import('./phone-verification-gate');
    mockProfileResult = { data: profile, refetch: jest.fn() };
    const view = renderWithTamagui(<PhoneVerificationGate />);

    expect(mockOtpModuleLoaded).not.toHaveBeenCalled();

    mockProfileResult = {
      data: { ...profile, needsPhoneVerification: true, phoneVerified: false },
      refetch: jest.fn(),
    };
    view.rerender(<PhoneVerificationGate />);

    expect(await screen.findByTestId('mock-otp-verification')).toBeTruthy();
    expect(mockOtpModuleLoaded).toHaveBeenCalledTimes(1);
  });
});
