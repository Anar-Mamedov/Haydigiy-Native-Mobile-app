import { useCallback, useEffect, useState } from 'react';

export type OtpCooldown = {
  /** `true` while the backend would still refuse a new code. */
  isCoolingDown: boolean;
  secondsLeft: number;
  /** Restarts the countdown, e.g. after the backend reports a fresh cooldown. */
  start: (seconds: number) => void;
};

/**
 * Ticks an OTP resend cooldown down to zero, one second at a time. Shared by every
 * OTP surface so the resend window is counted the same way everywhere instead of
 * each screen wiring its own interval.
 */
export function useOtpCooldown(initialSeconds = 0): OtpCooldown {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    // Clamped at zero: a burst of ticks (backgrounded app, busy JS thread) must
    // not push the countdown negative before the effect can tear the interval down.
    const interval = setInterval(() => {
      setSecondsLeft((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const start = useCallback((seconds: number) => {
    setSecondsLeft(Number.isFinite(seconds) ? Math.max(0, Math.ceil(seconds)) : 0);
  }, []);

  return { isCoolingDown: secondsLeft > 0, secondsLeft, start };
}
