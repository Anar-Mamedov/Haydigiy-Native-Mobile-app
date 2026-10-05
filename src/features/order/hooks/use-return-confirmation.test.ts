import { act, renderHook } from '@testing-library/react-native';
import { useReturnConfirmation } from './use-return-confirmation';

function deferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('useReturnConfirmation', () => {
  it('does not open the review sheet while the form cannot be submitted', () => {
    const { result } = renderHook(() => useReturnConfirmation(false, jest.fn()));

    act(() => result.current.request());

    expect(result.current.open).toBe(false);
  });

  it('opens on request and closes on cancel without submitting', () => {
    const submit = jest.fn();
    const { result } = renderHook(() => useReturnConfirmation(true, submit));

    act(() => result.current.request());
    expect(result.current.open).toBe(true);

    act(() => result.current.close());
    expect(result.current.open).toBe(false);
    expect(submit).not.toHaveBeenCalled();
  });

  // Onay sheet'i istek sürerken açık ve kilitli kalır; sonuç sheet'i açılırken kapanır.
  it('keeps the sheet open and locked until the submit settles', async () => {
    const pending = deferred();
    const submit = jest.fn(() => pending.promise);
    const { result } = renderHook(() => useReturnConfirmation(true, submit));

    act(() => result.current.request());

    let confirmation: Promise<void> = Promise.resolve();
    act(() => {
      confirmation = result.current.confirm();
    });

    expect(result.current.isConfirming).toBe(true);
    act(() => result.current.close());
    expect(result.current.open).toBe(true);

    // Çift dokunuş ikinci bir iade isteği göndermemeli.
    await act(async () => {
      await result.current.confirm();
    });
    expect(submit).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve();
      await confirmation;
    });

    expect(result.current.isConfirming).toBe(false);
    expect(result.current.open).toBe(false);
  });

  it('closes the sheet even when the submit rejects', async () => {
    const submit = jest.fn(() => Promise.reject(new Error('ağ hatası')));
    const { result } = renderHook(() => useReturnConfirmation(true, submit));

    act(() => result.current.request());
    await act(async () => {
      await expect(result.current.confirm()).rejects.toThrow('ağ hatası');
    });

    expect(result.current.isConfirming).toBe(false);
    expect(result.current.open).toBe(false);
  });
});
