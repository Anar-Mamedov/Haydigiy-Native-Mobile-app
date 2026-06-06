import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthStatus } from './use-auth-status';
import { useAuthStore } from '../store/use-auth-store';
import { isAuthenticated } from '../api/auth-session';

// Invoke the focus callback on render (mirrors a screen gaining focus) so the
// hook's session validation runs in tests, matching how the other screen tests
// mock expo-router's useFocusEffect.
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void | (() => void)) => {
    cb();
  },
}));

jest.mock('../api/auth-session', () => ({
  isAuthenticated: jest.fn(),
}));

const mockHasValidToken = isAuthenticated as jest.Mock;

const sampleUser = {
  id: '1',
  email: '',
  name: 'Anar',
  surname: 'Mamedov',
  phoneNumber: '5551234567',
};

describe('useAuthStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, isLoading: false });
  });

  it('reports authenticated immediately when the store already has a user', async () => {
    mockHasValidToken.mockResolvedValue(true);
    useAuthStore.setState({ user: sampleUser });

    const { result } = renderHook(() => useAuthStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
  });

  // Regression: a successful login updates the store while the profile screen is
  // already focused. The status must flip to authenticated without a refocus.
  it('reacts to a login that happens after mount', async () => {
    mockHasValidToken.mockResolvedValue(true);

    const { result } = renderHook(() => useAuthStatus());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      useAuthStore.setState({ user: sampleUser });
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
  });

  it('clears a stale user when the secure token is missing on focus', async () => {
    mockHasValidToken.mockResolvedValue(false);
    useAuthStore.setState({ user: sampleUser });

    const { result } = renderHook(() => useAuthStatus());

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
    expect(useAuthStore.getState().user).toBeNull();
  });
});
