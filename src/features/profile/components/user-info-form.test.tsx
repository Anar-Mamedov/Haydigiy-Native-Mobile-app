import { Alert } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { UserInfoForm } from './user-info-form';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { UserProfile } from '../api/profile.mapper';

const mockMutateAsync = jest.fn();

// The shared UI barrel pulls in app-header → expo-router; stub it. useFocusEffect
// is a no-op here (fields prefill from the form's defaultValues regardless of focus).
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  useFocusEffect: () => undefined,
}));

jest.mock('../api/profile.mutations', () => ({
  useUpdateProfileMutation: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

const profile: UserProfile = {
  name: 'Anar',
  surname: 'Mamedov',
  email: 'anar@example.com',
  phone: '5551234567',
  birthDate: '1990-05-08',
  gender: 'male',
  emailVerified: true,
  needsPhoneVerification: false,
  phoneVerificationStatus: null,
  phoneVerified: true,
};

describe('UserInfoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  it('shows the saved phone in an editable field beside the fixed country code', () => {
    renderWithTamagui(<UserInfoForm profile={profile} />);

    expect(screen.getByDisplayValue('Anar')).toBeTruthy();
    expect(screen.getByDisplayValue('Mamedov')).toBeTruthy();
    expect(screen.getByText('+90')).toBeTruthy();
    expect(screen.getByLabelText('Telefon Numarası').props.value).toBe('0555 123 45 67');
    expect(screen.getByText(/yeni numaranıza doğrulama kodu gönderilir/)).toBeTruthy();
  });

  it('stays readable in dark mode', () => {
    renderWithTamagui(<UserInfoForm profile={profile} />, 'dark');

    expect(screen.getByText('+90')).toBeTruthy();
    expect(screen.getByDisplayValue('0555 123 45 67')).toBeTruthy();
  });

  it('sends an unchanged saved phone back exactly as the API returned it', async () => {
    mockMutateAsync.mockResolvedValueOnce({ message: 'Profil başarıyla güncellendi.' });
    renderWithTamagui(<UserInfoForm profile={{ ...profile, phone: '+90 555 123 45 67' }} />);

    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '+90 555 123 45 67', version: 'v2' }),
      ),
    );
    expect(Alert.alert).toHaveBeenCalledWith('Başarılı', 'Bilgileriniz güncellendi.');
  });

  it('asks for the SMS code before saving a changed phone', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      code_sent: true,
      message: 'Doğrulama kodu yeni telefon numaranıza gönderildi.',
      resend_after: 60,
      success: true,
      verification_required: true,
    });
    renderWithTamagui(<UserInfoForm profile={profile} />);

    fireEvent.changeText(screen.getByLabelText('Telefon Numarası'), '0532 123 45 67');
    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '5321234567', version: 'v2' }),
      ),
    );
    // Nothing is saved yet, so no success message; the code sheet takes over.
    expect(await screen.findByText('Telefon Numarası Doğrulaması')).toBeTruthy();
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
  });

  it('saves an account without an e-mail without asking for one', async () => {
    // Regression: the form required an e-mail, unlike the web profile form, so
    // accounts registered with a phone could not save anything here.
    mockMutateAsync.mockResolvedValueOnce({ message: 'Profil başarıyla güncellendi.' });
    renderWithTamagui(<UserInfoForm profile={{ ...profile, email: null }} />);

    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));
    expect(mockMutateAsync.mock.calls[0][0]).not.toHaveProperty('email');
    expect(screen.queryByText('E-posta zorunludur')).toBeNull();
    expect(Alert.alert).toHaveBeenCalledWith('Başarılı', 'Bilgileriniz güncellendi.');
  });

  it('still rejects a malformed e-mail', async () => {
    renderWithTamagui(<UserInfoForm profile={{ ...profile, email: null }} />);

    fireEvent.changeText(screen.getByLabelText('E-posta'), 'anar@');
    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() =>
      expect(screen.getByText('Geçerli bir e-posta adresi giriniz')).toBeTruthy(),
    );
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('does not let a saved phone be cleared', async () => {
    renderWithTamagui(<UserInfoForm profile={profile} />);

    fireEvent.changeText(screen.getByLabelText('Telefon Numarası'), '');
    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() => expect(screen.getByText('Telefon numarası zorunludur.')).toBeTruthy());
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('allows an e-mail account without a phone to add one', async () => {
    mockMutateAsync.mockResolvedValueOnce({ message: 'Profil başarıyla güncellendi.' });
    renderWithTamagui(<UserInfoForm profile={{ ...profile, phone: null }} />);

    fireEvent.changeText(screen.getByLabelText('Telefon Numarası'), '0532 123 45 67');
    expect(screen.getByDisplayValue('0532 123 45 67')).toBeTruthy();

    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '5321234567' }),
      ),
    );
  });

  it('shows a duplicate-phone validation error below the phone field', async () => {
    const message = 'Bu telefon numarası başka bir kullanıcı tarafından kullanılıyor.';
    mockMutateAsync.mockRejectedValueOnce({
      response: { data: { errors: { phone: [message] }, message } },
    });
    renderWithTamagui(<UserInfoForm profile={{ ...profile, phone: null }} />);

    fireEvent.changeText(screen.getByLabelText('Telefon Numarası'), '0507 653 46 41');
    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() => expect(screen.getByText(message)).toBeTruthy());
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
  });

  it('submits the cleaned profile payload on save', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined);
    renderWithTamagui(<UserInfoForm profile={profile} />);

    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Anar',
          surname: 'Mamedov',
          email: 'anar@example.com',
          phone: '5551234567',
          birth_date: '1990-05-08',
          gender: 'male',
        }),
      ),
    );
  });

  it('blocks save and never calls the API when the name is too short', async () => {
    renderWithTamagui(<UserInfoForm profile={{ ...profile, name: '' }} />);

    fireEvent.changeText(screen.getByLabelText('Ad'), 'A');
    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() => expect(screen.getByText('Ad en az 2 karakter olmalıdır')).toBeTruthy());
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
