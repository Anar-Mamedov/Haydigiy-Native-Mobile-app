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
};

describe('UserInfoForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders editable fields prefilled and the read-only phone with country code', () => {
    renderWithTamagui(<UserInfoForm profile={profile} />);

    expect(screen.getByDisplayValue('Anar')).toBeTruthy();
    expect(screen.getByDisplayValue('Mamedov')).toBeTruthy();
    expect(screen.getByText('+90')).toBeTruthy();
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
