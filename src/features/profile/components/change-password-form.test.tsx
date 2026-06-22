import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ChangePasswordForm } from './change-password-form';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockMutateAsync = jest.fn();

// The shared UI barrel pulls in app-header → expo-router; stub it so the ESM-only
// navigation deps aren't loaded (this form itself doesn't route).
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  useFocusEffect: () => undefined,
}));

jest.mock('../api/profile.mutations', () => ({
  useChangePasswordMutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

describe('ChangePasswordForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders both password fields and the complexity hint', () => {
    renderWithTamagui(<ChangePasswordForm />);

    expect(screen.getByText('Yeni Şifre')).toBeTruthy();
    expect(screen.getByText('Yeni Şifre (Tekrar)')).toBeTruthy();
    expect(
      screen.getByText('Şifreniz 1 büyük harf, 1 küçük harf ve rakam içermelidir.'),
    ).toBeTruthy();
  });

  it('blocks submission for a weak password and never calls the API', async () => {
    renderWithTamagui(<ChangePasswordForm />);

    fireEvent.changeText(screen.getByLabelText('Yeni Şifre'), 'weak');
    fireEvent.changeText(screen.getByLabelText('Yeni Şifre (Tekrar)'), 'weak');
    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() => expect(screen.getByText('Şifre en az 8 karakter olmalıdır')).toBeTruthy());
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submits the new password when valid and matching', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined);
    renderWithTamagui(<ChangePasswordForm />);

    fireEvent.changeText(screen.getByLabelText('Yeni Şifre'), 'Abcdef12');
    fireEvent.changeText(screen.getByLabelText('Yeni Şifre (Tekrar)'), 'Abcdef12');
    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith('Abcdef12'));
  });
});
