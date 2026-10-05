import { useCallback, useRef, useState } from 'react';

/**
 * Owns the "review before submitting" step of the return flow: the sheet opens only
 * when the form can be submitted, stays open and locked while the request runs, and
 * closes once the submit settles so the success / error sheet takes over.
 */
export function useReturnConfirmation(canSubmit: boolean, submit: () => Promise<void>) {
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  // Guards against a double tap before the re-render disables the button.
  const inFlightRef = useRef(false);

  const request = useCallback(() => {
    if (canSubmit) setOpen(true);
  }, [canSubmit]);

  const close = useCallback(() => {
    if (!inFlightRef.current) setOpen(false);
  }, []);

  const confirm = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsConfirming(true);
    try {
      await submit();
    } finally {
      inFlightRef.current = false;
      setIsConfirming(false);
      setOpen(false);
    }
  }, [submit]);

  return { open, isConfirming, request, close, confirm };
}

export type UseReturnConfirmation = ReturnType<typeof useReturnConfirmation>;
