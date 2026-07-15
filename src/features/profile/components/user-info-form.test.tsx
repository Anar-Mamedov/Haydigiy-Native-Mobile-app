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
  beforeEach(() => jest.clearAllMocks());

  it('renders the prefilled phone as an editable field with the fixed country code', () => {
    renderWithTamagui(<UserInfoForm profile={profile} />);

    expect(screen.getByDisplayValue('Anar')).toBeTruthy();
    expect(screen.getByDisplayValue('Mamedov')).toBeTruthy();
    expect(screen.getByText('+90')).toBeTruthy();
    expect(screen.getByDisplayValue('0555 123 45 67').props.editable).not.toBe(false);
  });

  it('allows an e-mail account without a phone to add one', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined);
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
