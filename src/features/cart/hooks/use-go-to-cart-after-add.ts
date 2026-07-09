import { useCallback } from 'react';
import { useRouter } from 'expo-router';

/**
 * Sends the user to the cart after adding an item (instead of a success modal).
 * The cart screen shows a loading state on entry until the server returns the
 * up-to-date cart, so the just-added item never pops in after a stale-list flash.
 */
export function useGoToCartAfterAdd() {
  const router = useRouter();

  return useCallback(() => {
    router.push('/cart');
  }, [router]);
}
