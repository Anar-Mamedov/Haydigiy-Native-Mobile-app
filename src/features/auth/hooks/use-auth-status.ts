import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { isAuthenticated as hasValidToken } from '../api/auth-session';
import { useAuthStore } from '../store/use-auth-store';

export interface AuthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Reactive authentication status for the profile and auth flows.
 *
 * The in-memory Zustand user is the source of truth for the current session, so
 * a successful login / register / fast-login updates the UI immediately without
 * waiting for the screen to lose and regain focus.
 *
 * On every focus we additionally validate the persisted session against the
 * SecureStore token and drop a stale user when the token is gone (e.g. it was
 * cleared or expired out of band), keeping the session check centralized here.
 */
export function useAuthStatus(): AuthStatus {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      hasValidToken().then((tokenValid) => {
        if (!active) return;
        if (!tokenValid && useAuthStore.getState().user !== null) {
          setUser(null);
        }
        setIsLoading(false);
      });
      return () => {
        active = false;
      };
    }, [setUser])
  );

  return { isAuthenticated: user !== null, isLoading };
}
