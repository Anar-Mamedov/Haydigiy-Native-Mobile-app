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

  describe('the × buttons', () => {
    it('sends a cleared gender as null', async () => {
      mockMutateAsync.mockResolvedValueOnce({ message: 'Profil başarıyla güncellendi.' });
      renderWithTamagui(<UserInfoForm profile={profile} />);

      fireEvent.press(screen.getByLabelText('Cinsiyet seçimini kaldır'));
      fireEvent.press(screen.getByText('Kaydet'));

      await waitFor(() =>
        expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ gender: null })),
      );
    });

    // Doğum tarihi değiştirilebilir ama silinemez.
    it('offers no × on a saved birth date', () => {
      renderWithTamagui(<UserInfoForm profile={profile} />);

      expect(screen.queryByLabelText('Gün seçimini kaldır')).toBeNull();
      expect(screen.queryByLabelText('Ay seçimini kaldır')).toBeNull();
      expect(screen.queryByLabelText('Yıl seçimini kaldır')).toBeNull();
    });

    it('offers no × on a freshly picked birth date either', async () => {
      renderWithTamagui(<UserInfoForm profile={{ ...profile, birthDate: null }} />);

      fireEvent.press(screen.getByLabelText('Gün'));
      fireEvent.press(await screen.findByLabelText('5'));

      expect(screen.queryByLabelText('Gün seçimini kaldır')).toBeNull();
    });

    it('blocks saving a half-picked birth date', async () => {
      renderWithTamagui(<UserInfoForm profile={{ ...profile, birthDate: null }} />);

      fireEvent.press(screen.getByLabelText('Gün'));
      fireEvent.press(await screen.findByLabelText('5'));
      fireEvent.press(screen.getByText('Kaydet'));

      await waitFor(() => expect(screen.getByText('Doğum tarihini tamamlayın.')).toBeTruthy());
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('offers "Diğer" like the web form', async () => {
      mockMutateAsync.mockResolvedValueOnce({ message: 'Profil başarıyla güncellendi.' });
      renderWithTamagui(<UserInfoForm profile={profile} />);

      // Options of a closed sheet do not take touches, so open the gender select first.
      fireEvent.press(screen.getByLabelText('Cinsiyet'));
      fireEvent.press(await screen.findByLabelText('Diğer'));
      fireEvent.press(screen.getByText('Kaydet'));

      await waitFor(() =>
        expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ gender: 'other' })),
      );
    });
  });

  describe('16-year minimum age, like the web form', () => {
    beforeEach(() => {
      // Yalnız tarih sabitlenir (8 Ekim 2026 → sınır 8 Ekim 2010); zamanlayıcılar gerçek kalır.
      jest.useFakeTimers({
        doNotFake: [
          'cancelAnimationFrame',
          'cancelIdleCallback',
          'clearImmediate',
          'clearInterval',
          'clearTimeout',
          'hrtime',
          'nextTick',
          'performance',
          'queueMicrotask',
          'requestAnimationFrame',
          'requestIdleCallback',
          'setImmediate',
          'setInterval',
          'setTimeout',
        ],
        now: new Date(2026, 9, 8),
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('offers no year newer than 16 years ago', async () => {
      renderWithTamagui(<UserInfoForm profile={profile} />);

      fireEvent.press(screen.getByLabelText('Yıl'));

      expect(await screen.findByLabelText('2010')).toBeTruthy();
      expect(screen.queryByLabelText('2011')).toBeNull();
      expect(screen.queryByLabelText('2018')).toBeNull();
    });

    it('hides months and days that would make the user younger than 16', async () => {
      renderWithTamagui(<UserInfoForm profile={{ ...profile, birthDate: '2010-10-05' }} />);

      fireEvent.press(screen.getByLabelText('Ay'));
      expect(await screen.findByLabelText('Ekim')).toBeTruthy();
      expect(screen.queryByLabelText('Kasım')).toBeNull();

      fireEvent.press(screen.getByLabelText('Gün'));
      expect(await screen.findByLabelText('8')).toBeTruthy();
      expect(screen.queryByLabelText('9')).toBeNull();
    });

    it('clears a month the newly picked limit year no longer offers', async () => {
      renderWithTamagui(<UserInfoForm profile={{ ...profile, birthDate: '2009-11-20' }} />);

      fireEvent.press(screen.getByLabelText('Yıl'));
      fireEvent.press(await screen.findByLabelText('2010'));
      fireEvent.press(screen.getByText('Kaydet'));

      // Kasım boşaldığı için tarih yarım kalır; kullanıcı ayı yeniden seçmeden kaydedemez.
      await waitFor(() => expect(screen.getByText('Doğum tarihini tamamlayın.')).toBeTruthy());
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    // Web paritesi: eski kuralla (8 yaş) kaydedilmiş tarih seçili kalır ve olduğu gibi gönderilir.
    it('keeps a date saved under the old 8-year rule and saves it as-is', async () => {
      renderWithTamagui(<UserInfoForm profile={{ ...profile, birthDate: '2012-01-01' }} />);

      fireEvent.press(screen.getByText('Kaydet'));

      await waitFor(() =>
        expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ birth_date: '2012-01-01' })),
      );
    });

    it('drops the old year from the list once another year is picked', async () => {
      renderWithTamagui(<UserInfoForm profile={{ ...profile, birthDate: '2012-01-01' }} />);

      fireEvent.press(screen.getByLabelText('Yıl'));
      fireEvent.press(await screen.findByLabelText('2009'));
      fireEvent.press(screen.getByLabelText('Yıl'));

      expect(await screen.findByLabelText('2010')).toBeTruthy();
      expect(screen.queryByLabelText('2012')).toBeNull();
    });
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
