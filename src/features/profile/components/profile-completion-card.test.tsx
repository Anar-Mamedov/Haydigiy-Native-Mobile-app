import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProfileCompletionCard } from './profile-completion-card';
import { getProfileCompletion } from '../utils/profile-completion';

const FULL_PROFILE = {
  name: 'Ayşe',
  surname: 'Yılmaz',
  email: 'ayse@example.com',
  phone: '5321234567',
  birthDate: '1990-05-12',
  gender: 'female',
  emailVerified: true,
};

describe('ProfileCompletionCard', () => {
  it('shows the percent, the missing steps and a Tamamla action', () => {
    const onComplete = jest.fn();
    renderWithTamagui(
      <ProfileCompletionCard
        completion={getProfileCompletion({ ...FULL_PROFILE, gender: null, emailVerified: false })}
        loading={false}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByText('%71')).toBeTruthy();
    expect(screen.getByText('Eksik: Cinsiyet, E-posta doğrulaması')).toBeTruthy();
    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({ max: 100, min: 0, now: 71 });
    expect(screen.getByTestId('profile-completion-track-fill')).toHaveStyle({ width: '71%' });

    fireEvent.press(screen.getByRole('button', { name: 'Profili tamamla' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('keeps the missing list on one line so the card height stays fixed', () => {
    renderWithTamagui(<ProfileCompletionCard completion={getProfileCompletion(null)} loading={false} onComplete={jest.fn()} />);

    expect(screen.getByText(/^Eksik: Ad, Soyad/).props.numberOfLines).toBe(1);
    expect(screen.getByText('%0')).toBeTruthy();
  });

  it('shows the completed state without an action at 100%', () => {
    renderWithTamagui(<ProfileCompletionCard completion={getProfileCompletion(FULL_PROFILE)} loading={false} onComplete={jest.fn()} />);

    expect(screen.getByText('%100')).toBeTruthy();
    expect(screen.getByText('Profil bilgileriniz eksiksiz.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Profili tamamla' })).toBeNull();
  });

  it('draws a hidden skeleton while the profile loads', () => {
    renderWithTamagui(<ProfileCompletionCard completion={null} loading onComplete={jest.fn()} />);

    expect(screen.getByTestId('profile-completion-skeleton', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('renders nothing when the profile could not be read', () => {
    renderWithTamagui(<ProfileCompletionCard completion={null} loading={false} onComplete={jest.fn()} />);

    expect(screen.queryByTestId('profile-completion-skeleton', { includeHiddenElements: true })).toBeNull();
    expect(screen.queryByTestId('profile-completion-card')).toBeNull();
  });

  it('keeps its labels and action readable in the dark theme', () => {
    renderWithTamagui(
      <ProfileCompletionCard
        completion={getProfileCompletion({ ...FULL_PROFILE, emailVerified: false })}
        loading={false}
        onComplete={jest.fn()}
      />,
      'dark',
    );

    expect(screen.getByText('Profil doluluk oranı')).toBeTruthy();
    expect(screen.getByText('%86')).toBeTruthy();
    expect(screen.getByText('Eksik: E-posta doğrulaması')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Profili tamamla' })).toBeTruthy();
  });
});
