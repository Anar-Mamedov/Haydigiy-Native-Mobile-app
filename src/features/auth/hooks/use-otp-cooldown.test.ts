import { act, renderHook } from '@testing-library/react-native';
import { useOtpCooldown } from './use-otp-cooldown';

describe('useOtpCooldown', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('counts down to zero and stops there', () => {
    const { result } = renderHook(() => useOtpCooldown(2));

    expect(result.current.isCoolingDown).toBe(true);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isCoolingDown).toBe(false);
  });

  it('restarts from the seconds the backend reports', () => {
    const { result } = renderHook(() => useOtpCooldown());

    act(() => result.current.start(45.2));
    expect(result.current.secondsLeft).toBe(46);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(45);
  });

  it('ignores non-finite and negative cooldowns', () => {
    const { result } = renderHook(() => useOtpCooldown());

    act(() => result.current.start(Number.NaN));
    expect(result.current.secondsLeft).toBe(0);

    act(() => result.current.start(-10));
    expect(result.current.secondsLeft).toBe(0);
  });
});
