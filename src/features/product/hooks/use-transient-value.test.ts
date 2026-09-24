import { act, renderHook } from '@testing-library/react-native';
import { useTransientValue } from './use-transient-value';

const DURATION = 1500;

describe('useTransientValue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('starts empty', () => {
    const { result } = renderHook(() => useTransientValue<number>(DURATION));

    expect(result.current.value).toBeNull();
  });

  it('holds the shown value until the duration passes', () => {
    const { result } = renderHook(() => useTransientValue<number>(DURATION));

    act(() => result.current.show(12));
    expect(result.current.value).toBe(12);

    act(() => jest.advanceTimersByTime(DURATION - 1));
    expect(result.current.value).toBe(12);

    act(() => jest.advanceTimersByTime(1));
    expect(result.current.value).toBeNull();
  });

  it('restarts the countdown when a new value is shown', () => {
    const { result } = renderHook(() => useTransientValue<number>(DURATION));

    act(() => result.current.show(12));
    act(() => jest.advanceTimersByTime(DURATION - 100));
    act(() => result.current.show(13));
    act(() => jest.advanceTimersByTime(200));

    // İlk sayaç iptal edildi; yeni değer kendi süresini doldurmadan silinmez.
    expect(result.current.value).toBe(13);

    act(() => jest.advanceTimersByTime(DURATION));
    expect(result.current.value).toBeNull();
  });

  it('clears the value at once', () => {
    const { result } = renderHook(() => useTransientValue<number>(DURATION));

    act(() => result.current.show(12));
    act(() => result.current.clear());

    expect(result.current.value).toBeNull();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('leaves no pending timer behind after unmount', () => {
    const { result, unmount } = renderHook(() => useTransientValue<number>(DURATION));

    act(() => result.current.show(12));
    unmount();

    expect(jest.getTimerCount()).toBe(0);
  });
});
