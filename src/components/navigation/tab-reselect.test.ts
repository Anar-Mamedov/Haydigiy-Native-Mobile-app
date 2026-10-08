import { renderHook } from '@testing-library/react-native';
import { notifyTabReselect, useTabReselect } from './tab-reselect';

describe('tab reselect', () => {
  it('calls the listeners of the reselected tab only', () => {
    const onHome = jest.fn();
    const onCart = jest.fn();
    renderHook(() => useTabReselect('/', onHome));
    renderHook(() => useTabReselect('/cart', onCart));

    notifyTabReselect('/');

    expect(onHome).toHaveBeenCalledTimes(1);
    expect(onCart).not.toHaveBeenCalled();
  });

  it('stops calling a listener after its screen unmounts', () => {
    const onHome = jest.fn();
    const { unmount } = renderHook(() => useTabReselect('/', onHome));

    unmount();
    notifyTabReselect('/');

    expect(onHome).not.toHaveBeenCalled();
  });

  it('ignores a reselect nobody listens to', () => {
    expect(() => notifyTabReselect('/profile')).not.toThrow();
  });
});
