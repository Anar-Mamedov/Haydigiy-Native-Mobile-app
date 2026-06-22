import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { DeleteAccountButton } from './delete-account-button';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockMutateAsync = jest.fn();
const mockLogout = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, back: jest.fn(), canGoBack: () => false }),
}));

jest.mock('@/features/auth/api/auth.mutations', () => ({
  useDeactivateAccountMutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

jest.mock('@/features/auth/store/use-auth-store', () => ({
  useAuthStore: (selector: (state: { logout: () => void }) => unknown) =>
    selector({ logout: mockLogout }),
}));

describe('DeleteAccountButton', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens a destructive confirmation when pressed', () => {
    renderWithTamagui(<DeleteAccountButton />);

    fireEvent.press(screen.getByLabelText('Hesabımı Sil'));
    expect(screen.getByText('Hesabınızı Silmek İstediğinize Emin Misiniz?')).toBeTruthy();
  });

  it('deactivates the account and signs out on confirm', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined);
    mockLogout.mockResolvedValueOnce(undefined);
    renderWithTamagui(<DeleteAccountButton />);

    fireEvent.press(screen.getByLabelText('Hesabımı Sil'));
    fireEvent.press(screen.getByText('Evet, Sil'));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
  });
});
