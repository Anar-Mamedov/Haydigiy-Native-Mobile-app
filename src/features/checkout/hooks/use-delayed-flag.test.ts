import { act, renderHook } from '@testing-library/react-native';
import { useDelayedFlag } from './use-delayed-flag';

describe('useDelayedFlag', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stays off while the flag is inactive', () => {
    const { result } = renderHook(() => useDelayedFlag(false, 400));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(false);
  });

  it('stays off until the delay elapses', () => {
    const { result } = renderHook<boolean, { active: boolean }>(({ active }) => useDelayedFlag(active, 400), {
      initialProps: { active: true },
    });

    expect(result.current).toBe(false);

    act(() => {
      jest.advanceTimersByTime(399);
    });
    expect(result.current).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);
  });

  it('never turns on when the flag clears before the delay elapses', () => {
    const { rerender, result } = renderHook<boolean, { active: boolean }>(({ active }) => useDelayedFlag(active, 400), {
      initialProps: { active: true },
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });
    rerender({ active: false });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(false);
  });

  it('turns off immediately when the flag clears after it turned on', () => {
    const { rerender, result } = renderHook<boolean, { active: boolean }>(({ active }) => useDelayedFlag(active, 400), {
      initialProps: { active: true },
    });

    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current).toBe(true);

    rerender({ active: false });

    expect(result.current).toBe(false);
  });

  it('waits the full delay again on the next activation', () => {
    const { rerender, result } = renderHook<boolean, { active: boolean }>(({ active }) => useDelayedFlag(active, 400), {
      initialProps: { active: true },
    });

    act(() => {
      jest.advanceTimersByTime(400);
    });
    rerender({ active: false });
    rerender({ active: true });

    // Önceki turdan kalan "beklendi" durumu katmanı anında açmamalı.
    expect(result.current).toBe(false);

    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current).toBe(true);
  });
});
