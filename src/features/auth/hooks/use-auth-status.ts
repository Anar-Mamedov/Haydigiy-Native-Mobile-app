import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { isAuthenticated } from '../api/auth-session';

export interface AuthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Provides the current authentication status to screens, refreshing whenever the
 * screen regains focus. Encapsulates the centralized auth check so screens never
 * read tokens or env directly.
 */
export function useAuthStatus(): AuthStatus {
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      isAuthenticated().then((result) => {
        if (!active) return;
        setAuthenticated(result);
        setIsLoading(false);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  return { isAuthenticated: authenticated, isLoading };
}
