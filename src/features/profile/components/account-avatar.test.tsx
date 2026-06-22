import { screen } from '@testing-library/react-native';
import { AccountAvatar } from './account-avatar';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('AccountAvatar', () => {
  it('derives two uppercase initials from name and surname', () => {
    renderWithTamagui(<AccountAvatar name="anar" surname="mamedov" />);
    expect(screen.getByText('AM')).toBeTruthy();
  });

  it('falls back to the e-mail initial when the name is missing', () => {
    renderWithTamagui(<AccountAvatar email="test@example.com" />);
    expect(screen.getByText('T')).toBeTruthy();
  });

  it('uses a single initial when only the name is provided', () => {
    renderWithTamagui(<AccountAvatar name="Anar" />);
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('renders a default initial when nothing identifies the user', () => {
    renderWithTamagui(<AccountAvatar />);
    expect(screen.getByText('U')).toBeTruthy();
  });
});
