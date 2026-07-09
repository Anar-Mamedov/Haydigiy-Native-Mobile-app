import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCartQuery } from '@/features/cart/api/cart.queries';
import { cartKeys } from '@/features/cart/api/cart.keys';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { mergeCartDto } from '@/services/cart.service';

/**
 * Headless component mounted once at the app root (inside the providers).
 *
 * 1. Keeps the cart fetched/hydrated in the Zustand store so every cart badge
 *    (tab bar, headers, product screens) reads a single source of truth.
 * 2. Merges the guest (device_id) cart into the account cart whenever the user
 *    becomes authenticated — on login or on launch while already signed in —
 *    exactly like the web `Providers`. Runs once per authenticated session so
 *    items added before login are not lost, then refreshes the cart.
 */
export function CartHydrator() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const hasMergedForSession = useRef(false);

  useEffect(() => {
    if (!user) {
      // Reset so the next login merges that session's guest cart again.
      hasMergedForSession.current = false;
      return;
    }
    if (hasMergedForSession.current) return;
    hasMergedForSession.current = true;

    let cancelled = false;
    const mergeGuestCart = async () => {
      try {
        await mergeCartDto();
      } catch {
        // Guest-cart merge is a best-effort background sync. If it fails (for
        // example while the app is navigating or the connection drops), keep the
        // app stable and let the cart query below continue with the current cart.
      } finally {
        if (!cancelled) {
          queryClient.invalidateQueries({ queryKey: cartKeys.all });
        }
      }
    };
    void mergeGuestCart();

    return () => {
      cancelled = true;
    };
  }, [user, queryClient]);

  useCartQuery();
  return null;
}
